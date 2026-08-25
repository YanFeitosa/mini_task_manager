package com.yanfeitosa.taskmanager.task;

import com.yanfeitosa.taskmanager.team.Team;
import com.yanfeitosa.taskmanager.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    protected Task() {
    }

    public Task(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            Team team,
            LocalDate dueDate
    ) {
        update(title, description, status, priority, assignee, team, dueDate);
    }

    public void update(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            Team team,
            LocalDate dueDate
    ) {
        validateCompletion(status, assignee);
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.assignee = assignee;
        this.team = team;
        this.dueDate = dueDate;
    }

    private void validateCompletion(TaskStatus status, User assignee) {
        if (status == TaskStatus.COMPLETED && assignee == null) {
            throw new TaskCompletionException();
        }
    }

    @PrePersist
    void setCreationTimestamp() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public User getAssignee() {
        return assignee;
    }

    public Team getTeam() {
        return team;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }
}
