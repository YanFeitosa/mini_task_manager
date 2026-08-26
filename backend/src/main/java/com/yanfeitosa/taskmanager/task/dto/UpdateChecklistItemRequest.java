package com.yanfeitosa.taskmanager.task.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateChecklistItemRequest(@NotNull Boolean completed) {
}
