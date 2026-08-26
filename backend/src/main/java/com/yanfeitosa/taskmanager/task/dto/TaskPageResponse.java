package com.yanfeitosa.taskmanager.task.dto;

import com.yanfeitosa.taskmanager.task.Task;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public record TaskPageResponse(
        List<TaskResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static TaskPageResponse from(Page<Task> tasks, LocalDate today) {
        return new TaskPageResponse(
                tasks.getContent().stream().map(task -> TaskResponse.from(task, today)).toList(),
                tasks.getNumber(),
                tasks.getSize(),
                tasks.getTotalElements(),
                tasks.getTotalPages()
        );
    }
}
