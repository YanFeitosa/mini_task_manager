package com.yanfeitosa.taskmanager.task.dto;

import com.yanfeitosa.taskmanager.task.TaskPriority;
import com.yanfeitosa.taskmanager.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SaveTaskRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 5000) String description,
        @NotNull TaskStatus status,
        @NotNull TaskPriority priority,
        @Positive Long assigneeId,
        @NotNull @Positive Long teamId,
        LocalDate dueDate
) {
}
