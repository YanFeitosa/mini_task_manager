package com.yanfeitosa.taskmanager.task;

import com.yanfeitosa.taskmanager.task.dto.SaveTaskRequest;
import com.yanfeitosa.taskmanager.task.dto.TaskPageResponse;
import com.yanfeitosa.taskmanager.task.dto.TaskResponse;
import com.yanfeitosa.taskmanager.task.dto.UpdateChecklistItemRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody SaveTaskRequest request,
            Authentication authentication
    ) {
        TaskResponse response = taskService.create(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable Long id, Authentication authentication) {
        return taskService.getById(id, authentication.getName());
    }

    @GetMapping
    public TaskPageResponse list(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) Long assigneeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication
    ) {
        return taskService.list(
                authentication.getName(),
                status,
                overdue,
                priority,
                assigneeId,
                pageable
        );
    }

    @PutMapping("/{id}")
    public TaskResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SaveTaskRequest request,
            Authentication authentication
    ) {
        return taskService.update(id, authentication.getName(), request);
    }

    @PatchMapping("/{taskId}/checklist/{itemId}")
    public TaskResponse updateChecklistItem(
            @PathVariable Long taskId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateChecklistItemRequest request,
            Authentication authentication
    ) {
        return taskService.updateChecklistItem(
                taskId,
                itemId,
                authentication.getName(),
                request
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        taskService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
