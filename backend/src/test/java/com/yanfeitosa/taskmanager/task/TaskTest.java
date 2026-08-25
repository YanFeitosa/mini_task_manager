package com.yanfeitosa.taskmanager.task;

import com.yanfeitosa.taskmanager.team.Team;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TaskTest {

    @Test
    void shouldRejectCompletedTaskWithoutAssignee() {
        Team team = new Team("Platform");

        assertThrows(
                TaskCompletionException.class,
                () -> new Task(
                        "Release API",
                        null,
                        TaskStatus.COMPLETED,
                        TaskPriority.HIGH,
                        null,
                        team,
                        LocalDate.now()
                )
        );
    }

    @Test
    void shouldKeepPreviousStateWhenInvalidCompletionIsAttempted() {
        Team team = new Team("Platform");
        Task task = new Task(
                "Release API",
                null,
                TaskStatus.TODO,
                TaskPriority.HIGH,
                null,
                team,
                LocalDate.now()
        );

        assertThrows(
                TaskCompletionException.class,
                () -> task.update(
                        "Release API",
                        null,
                        TaskStatus.COMPLETED,
                        TaskPriority.HIGH,
                        null,
                        team,
                        LocalDate.now()
                )
        );
        assertEquals(TaskStatus.TODO, task.getStatus());
    }

    @Test
    void shouldBeOverdueOnlyWhenTodoDeadlineHasPassed() {
        LocalDate today = LocalDate.of(2026, 8, 24);
        Team team = new Team("Platform");
        Task overdueTask = new Task(
                "Overdue task",
                null,
                TaskStatus.TODO,
                TaskPriority.MEDIUM,
                null,
                team,
                today.minusDays(1)
        );
        Task dueToday = new Task(
                "Due today",
                null,
                TaskStatus.TODO,
                TaskPriority.MEDIUM,
                null,
                team,
                today
        );
        Task inProgress = new Task(
                "In progress",
                null,
                TaskStatus.IN_PROGRESS,
                TaskPriority.MEDIUM,
                null,
                team,
                today.minusDays(1)
        );

        assertTrue(overdueTask.isOverdue(today));
        assertFalse(dueToday.isOverdue(today));
        assertFalse(inProgress.isOverdue(today));
    }
}
