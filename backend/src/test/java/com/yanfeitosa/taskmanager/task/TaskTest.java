package com.yanfeitosa.taskmanager.task;

import com.yanfeitosa.taskmanager.team.Team;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TaskTest {

    @Test
    void shouldRejectCompletedTaskWithoutAssignee() {
        Team team = new Team("Platform");

        assertThrows(
                TaskCompletionException.class,
                () -> new Task(
                        "Release API",
                        null,
                        TaskStatus.COMPLETED,
                        TaskPriority.HIGH,
                        null,
                        team,
                        LocalDate.now()
                )
        );
    }

    @Test
    void shouldKeepPreviousStateWhenInvalidCompletionIsAttempted() {
        Team team = new Team("Platform");
        Task task = new Task(
                "Release API",
                null,
                TaskStatus.TODO,
                TaskPriority.HIGH,
                null,
                team,
                LocalDate.now()
        );

        assertThrows(
                TaskCompletionException.class,
                () -> task.update(
                        "Release API",
                        null,
                        TaskStatus.COMPLETED,
                        TaskPriority.HIGH,
                        null,
                        team,
                        LocalDate.now()
                )
        );
        assertEquals(TaskStatus.TODO, task.getStatus());
    }
}
