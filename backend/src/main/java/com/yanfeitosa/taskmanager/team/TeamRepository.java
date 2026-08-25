package com.yanfeitosa.taskmanager.team;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {

    @EntityGraph(attributePaths = "members")
    List<Team> findDistinctByMembersEmailOrderByNameAsc(String email);

    @EntityGraph(attributePaths = "members")
    Optional<Team> findByIdAndMembersEmail(Long id, String email);
}
