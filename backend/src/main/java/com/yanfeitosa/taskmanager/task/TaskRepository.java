package com.yanfeitosa.taskmanager.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @EntityGraph(attributePaths = {"assignee", "team"})
    @Query(
            value = """
                    select task
                    from Task task
                    join task.team team
                    join team.members member
                    left join task.assignee assignee
                    where member.email = :currentUserEmail
                      and (:status is null or task.status = :status)
                      and (
                        :overdue is null
                        or (:overdue = true and task.dueDate < :today)
                        or (:overdue = false and (task.dueDate is null or task.dueDate >= :today))
                      )
                      and (:priority is null or task.priority = :priority)
                      and (:assigneeId is null or assignee.id = :assigneeId)
                    """,
            countQuery = """
                    select count(task)
                    from Task task
                    join task.team team
                    join team.members member
                    left join task.assignee assignee
                    where member.email = :currentUserEmail
                      and (:status is null or task.status = :status)
                      and (
                        :overdue is null
                        or (:overdue = true and task.dueDate < :today)
                        or (:overdue = false and (task.dueDate is null or task.dueDate >= :today))
                      )
                      and (:priority is null or task.priority = :priority)
                      and (:assigneeId is null or assignee.id = :assigneeId)
                    """
    )
    Page<Task> findAccessibleTasks(
            @Param("currentUserEmail") String currentUserEmail,
            @Param("status") TaskStatus status,
            @Param("overdue") Boolean overdue,
            @Param("today") LocalDate today,
            @Param("priority") TaskPriority priority,
            @Param("assigneeId") Long assigneeId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"assignee", "team", "checklistItems"})
    Optional<Task> findByIdAndTeamMembersEmail(Long id, String email);
}
