package com.yanfeitosa.taskmanager.team;

import com.yanfeitosa.taskmanager.team.dto.AddTeamMemberRequest;
import com.yanfeitosa.taskmanager.team.dto.CreateTeamRequest;
import com.yanfeitosa.taskmanager.team.dto.TeamResponse;
import com.yanfeitosa.taskmanager.user.User;
import com.yanfeitosa.taskmanager.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TeamResponse create(String currentUserEmail, CreateTeamRequest request) {
        User currentUser = findCurrentUser(currentUserEmail);
        Team team = new Team(request.name().trim());
        team.addMember(currentUser);
        return TeamResponse.from(teamRepository.save(team));
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> list(String currentUserEmail) {
        return teamRepository.findDistinctByMembersEmailOrderByNameAsc(currentUserEmail).stream()
                .map(TeamResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getById(Long teamId, String currentUserEmail) {
        return TeamResponse.from(findAccessibleTeam(teamId, currentUserEmail));
    }

    @Transactional
    public TeamResponse addMember(
            Long teamId,
            String currentUserEmail,
            AddTeamMemberRequest request
    ) {
        Team team = findAccessibleTeam(teamId, currentUserEmail);
        User newMember = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        team.addMember(newMember);
        return TeamResponse.from(team);
    }

    private User findCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user no longer exists"
                ));
    }

    private Team findAccessibleTeam(Long teamId, String currentUserEmail) {
        return teamRepository.findByIdAndMembersEmail(teamId, currentUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
    }
}
