package com.yanfeitosa.taskmanager.task;

import com.yanfeitosa.taskmanager.team.Team;
import com.yanfeitosa.taskmanager.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

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

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @BatchSize(size = 20)
    private List<TaskChecklistItem> checklistItems = new ArrayList<>();

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

    public Task(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            Team team,
            LocalDate dueDate,
            List<TaskChecklistItem> checklistItems
    ) {
        update(title, description, status, priority, assignee, team, dueDate, checklistItems);
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
        validateCompletion(status, assignee, checklistItems);
        updateFields(title, description, status, priority, assignee, team, dueDate);
    }

    public void update(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            Team team,
            LocalDate dueDate,
            List<TaskChecklistItem> checklistItems
    ) {
        validateCompletion(status, assignee, checklistItems);
        updateFields(title, description, status, priority, assignee, team, dueDate);
        replaceChecklist(checklistItems);
    }

    private void updateFields(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            Team team,
            LocalDate dueDate
    ) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.assignee = assignee;
        this.team = team;
        this.dueDate = dueDate;
    }

    private void replaceChecklist(List<TaskChecklistItem> newItems) {
        checklistItems.clear();
        for (int index = 0; index < newItems.size(); index++) {
            TaskChecklistItem item = newItems.get(index);
            item.attachTo(this, index);
            checklistItems.add(item);
        }
    }

    private void validateCompletion(
            TaskStatus status,
            User assignee,
            List<TaskChecklistItem> checklistItems
    ) {
        if (status == TaskStatus.COMPLETED && assignee == null) {
            throw new TaskCompletionException();
        }
        if (status == TaskStatus.COMPLETED
                && checklistItems.stream().anyMatch(item -> !item.isCompleted())) {
            throw new TaskCompletionException(
                    "A task can only be completed when all checklist items are completed"
            );
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

    public boolean isOverdue(LocalDate today) {
        return status == TaskStatus.TODO && dueDate != null && dueDate.isBefore(today);
    }

    public List<TaskChecklistItem> getChecklistItems() {
        return Collections.unmodifiableList(checklistItems);
    }

    public boolean updateChecklistItem(Long itemId, boolean completed) {
        TaskChecklistItem item = checklistItems.stream()
                .filter(checklistItem -> Objects.equals(checklistItem.getId(), itemId))
                .findFirst()
                .orElse(null);

        if (item == null) {
            return false;
        }
        if (status == TaskStatus.COMPLETED && !completed) {
            throw new TaskCompletionException(
                    "A completed task must keep all checklist items completed"
            );
        }

        item.setCompleted(completed);
        return true;
    }

    public int getProgress() {
        if (checklistItems.isEmpty()) {
            return status == TaskStatus.COMPLETED ? 100 : 0;
        }

        long completedItems = checklistItems.stream().filter(TaskChecklistItem::isCompleted).count();
        return (int) Math.round(completedItems * 100.0 / checklistItems.size());
    }
}
