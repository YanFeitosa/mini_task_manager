package com.yanfeitosa.taskmanager.team;

import com.yanfeitosa.taskmanager.team.dto.AddTeamMemberRequest;
import com.yanfeitosa.taskmanager.team.dto.CreateTeamRequest;
import com.yanfeitosa.taskmanager.team.dto.TeamResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamResponse> create(
            @Valid @RequestBody CreateTeamRequest request,
            Authentication authentication
    ) {
        TeamResponse response = teamService.create(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<TeamResponse> list(Authentication authentication) {
        return teamService.list(authentication.getName());
    }

    @GetMapping("/{id}")
    public TeamResponse getById(@PathVariable Long id, Authentication authentication) {
        return teamService.getById(id, authentication.getName());
    }

    @PostMapping("/{id}/members")
    public TeamResponse addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddTeamMemberRequest request,
            Authentication authentication
    ) {
        return teamService.addMember(id, authentication.getName(), request);
    }
}
