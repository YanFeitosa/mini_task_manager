package com.yanfeitosa.taskmanager.task.dto;

import com.yanfeitosa.taskmanager.task.Task;
import com.yanfeitosa.taskmanager.task.TaskChecklistItem;
import com.yanfeitosa.taskmanager.task.TaskPriority;
import com.yanfeitosa.taskmanager.task.TaskStatus;
import com.yanfeitosa.taskmanager.user.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        AssigneeResponse assignee,
        TeamSummary team,
        Instant createdAt,
        LocalDate dueDate,
        boolean overdue,
        int progress,
        List<ChecklistItemResponse> checklist
) {

    public static TaskResponse from(Task task) {
        return from(task, LocalDate.now());
    }

    public static TaskResponse from(Task task, LocalDate today) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                AssigneeResponse.from(task.getAssignee()),
                new TeamSummary(task.getTeam().getId(), task.getTeam().getName()),
                task.getCreatedAt(),
                task.getDueDate(),
                task.isOverdue(today),
                task.getProgress(),
                task.getChecklistItems().stream().map(ChecklistItemResponse::from).toList()
        );
    }

    public record AssigneeResponse(Long id, String name, String email) {

        static AssigneeResponse from(User user) {
            if (user == null) {
                return null;
            }
            return new AssigneeResponse(user.getId(), user.getName(), user.getEmail());
        }
    }

    public record TeamSummary(Long id, String name) {
    }

    public record ChecklistItemResponse(Long id, String description, boolean completed) {

        static ChecklistItemResponse from(TaskChecklistItem item) {
            return new ChecklistItemResponse(item.getId(), item.getDescription(), item.isCompleted());
        }
    }
}
