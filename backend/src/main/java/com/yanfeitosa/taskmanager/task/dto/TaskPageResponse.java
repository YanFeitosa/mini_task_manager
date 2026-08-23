package com.yanfeitosa.taskmanager.task.dto;

import com.yanfeitosa.taskmanager.task.Task;
import org.springframework.data.domain.Page;

import java.util.List;

public record TaskPageResponse(
        List<TaskResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static TaskPageResponse from(Page<Task> tasks) {
        return new TaskPageResponse(
                tasks.getContent().stream().map(TaskResponse::from).toList(),
                tasks.getNumber(),
                tasks.getSize(),
                tasks.getTotalElements(),
                tasks.getTotalPages()
        );
    }
}
