package com.yanfeitosa.taskmanager.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_checklist_items")
public class TaskChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false)
    private int position;

    protected TaskChecklistItem() {
    }

    public TaskChecklistItem(String description, boolean completed) {
        this.description = description.trim();
        this.completed = completed;
    }

    void attachTo(Task task, int position) {
        this.task = task;
        this.position = position;
    }

    void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompleted() {
        return completed;
    }
}
