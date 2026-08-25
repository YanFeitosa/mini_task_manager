package com.yanfeitosa.taskmanager.team.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddTeamMemberRequest(
        @NotNull @Positive Long userId
) {
}
