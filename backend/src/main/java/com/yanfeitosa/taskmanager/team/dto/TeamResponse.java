package com.yanfeitosa.taskmanager.team.dto;

import com.yanfeitosa.taskmanager.team.Team;
import com.yanfeitosa.taskmanager.user.User;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record TeamResponse(
        Long id,
        String name,
        Instant createdAt,
        List<MemberResponse> members
) {

    public static TeamResponse from(Team team) {
        List<MemberResponse> members = team.getMembers().stream()
                .sorted(Comparator.comparing(User::getName).thenComparing(User::getId))
                .map(MemberResponse::from)
                .toList();

        return new TeamResponse(team.getId(), team.getName(), team.getCreatedAt(), members);
    }

    public record MemberResponse(Long id, String name, String email) {

        static MemberResponse from(User user) {
            return new MemberResponse(user.getId(), user.getName(), user.getEmail());
        }
    }
}
