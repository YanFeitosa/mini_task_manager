package com.yanfeitosa.taskmanager.task;

import com.yanfeitosa.taskmanager.task.dto.SaveTaskRequest;
import com.yanfeitosa.taskmanager.task.dto.TaskResponse;
import com.yanfeitosa.taskmanager.team.Team;
import com.yanfeitosa.taskmanager.team.TeamRepository;
import com.yanfeitosa.taskmanager.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;

    public TaskService(TaskRepository taskRepository, TeamRepository teamRepository) {
        this.taskRepository = taskRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional
    public TaskResponse create(String currentUserEmail, SaveTaskRequest request) {
        Team team = findAccessibleTeam(request.teamId(), currentUserEmail);
        User assignee = findAssignee(team, request.assigneeId());
        Task task = new Task(
                request.title().trim(),
                request.description(),
                request.status(),
                request.priority(),
                assignee,
                team,
                request.dueDate()
        );

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long taskId, String currentUserEmail) {
        return TaskResponse.from(findAccessibleTask(taskId, currentUserEmail));
    }

    @Transactional
    public TaskResponse update(Long taskId, String currentUserEmail, SaveTaskRequest request) {
        Task task = findAccessibleTask(taskId, currentUserEmail);
        Team team = findAccessibleTeam(request.teamId(), currentUserEmail);
        User assignee = findAssignee(team, request.assigneeId());

        task.update(
                request.title().trim(),
                request.description(),
                request.status(),
                request.priority(),
                assignee,
                team,
                request.dueDate()
        );

        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long taskId, String currentUserEmail) {
        taskRepository.delete(findAccessibleTask(taskId, currentUserEmail));
    }

    private Task findAccessibleTask(Long taskId, String currentUserEmail) {
        return taskRepository.findByIdAndTeamMembersEmail(taskId, currentUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private Team findAccessibleTeam(Long teamId, String currentUserEmail) {
        return teamRepository.findByIdAndMembersEmail(teamId, currentUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
    }

    private User findAssignee(Team team, Long assigneeId) {
        if (assigneeId == null) {
            return null;
        }

        return team.getMembers().stream()
                .filter(member -> member.getId().equals(assigneeId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_CONTENT,
                        "Assignee must be a member of the task team"
                ));
    }
}
