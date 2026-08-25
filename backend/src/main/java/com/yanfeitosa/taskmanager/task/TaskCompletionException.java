package com.yanfeitosa.taskmanager.task;

public class TaskCompletionException extends RuntimeException {

    public TaskCompletionException() {
        super("A task can only be completed when it has an assignee");
    }

    public TaskCompletionException(String message) {
        super(message);
    }
}
