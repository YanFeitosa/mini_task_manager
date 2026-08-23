package com.yanfeitosa.taskmanager.task;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TaskControllerIntegrationTests {

    private static final String PASSWORD = "strong-password";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateReadUpdateAndDeleteTask() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");
        RegisteredUser bob = registerAndLogin("Bob", "bob@example.com");
        long teamId = createTeam(alice.accessToken(), "Platform");
        addTeamMember(alice.accessToken(), teamId, bob.id());

        MvcResult createResult = mockMvc.perform(post("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody("Release API", "TODO", "HIGH", bob.id(), teamId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Release API"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.assignee.id").value(bob.id()))
                .andExpect(jsonPath("$.team.id").value(teamId))
                .andReturn();

        Number taskIdValue = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
        long taskId = taskIdValue.longValue();

        mockMvc.perform(get("/tasks/{id}", taskId)
                        .header(AUTHORIZATION, bearer(bob.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId));

        mockMvc.perform(put("/tasks/{id}", taskId)
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody("Release public API", "COMPLETED", "MEDIUM", bob.id(), teamId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Release public API"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));

        mockMvc.perform(delete("/tasks/{id}", taskId)
                        .header(AUTHORIZATION, bearer(alice.accessToken())))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/tasks/{id}", taskId)
                        .header(AUTHORIZATION, bearer(alice.accessToken())))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldEnforceTaskTeamAndAssigneeRules() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");
        RegisteredUser bob = registerAndLogin("Bob", "bob@example.com");
        long teamId = createTeam(alice.accessToken(), "Private Team");

        mockMvc.perform(post("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody("Invalid completion", "COMPLETED", "HIGH", null, teamId)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.title").value("Task cannot be completed"));

        mockMvc.perform(post("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody("Invalid assignee", "TODO", "HIGH", bob.id(), teamId)))
                .andExpect(status().isUnprocessableContent());

        MvcResult createResult = mockMvc.perform(post("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody("Private task", "TODO", "LOW", null, teamId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assignee").isEmpty())
                .andReturn();

        Number taskIdValue = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
        mockMvc.perform(get("/tasks/{id}", taskIdValue.longValue())
                        .header(AUTHORIZATION, bearer(bob.accessToken())))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListOnlyAccessibleTasksWithPaginationAndSorting() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");
        RegisteredUser bob = registerAndLogin("Bob", "bob@example.com");
        long sharedTeamId = createTeam(alice.accessToken(), "Shared Team");
        long privateTeamId = createTeam(alice.accessToken(), "Private Team");
        addTeamMember(alice.accessToken(), sharedTeamId, bob.id());

        createTask(alice.accessToken(), "Zulu task", "TODO", "HIGH", bob.id(), sharedTeamId);
        createTask(alice.accessToken(), "Alpha task", "TODO", "LOW", null, sharedTeamId);
        createTask(alice.accessToken(), "Private task", "TODO", "HIGH", alice.id(), privateTeamId);

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(bob.accessToken()))
                        .param("page", "0")
                        .param("size", "1")
                        .param("sort", "title,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Alpha task"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(bob.accessToken()))
                        .param("page", "1")
                        .param("size", "1")
                        .param("sort", "title,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Zulu task"));
    }

    @Test
    void shouldFilterTasksByStatusPriorityAndAssignee() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");
        RegisteredUser bob = registerAndLogin("Bob", "bob@example.com");
        long teamId = createTeam(alice.accessToken(), "Platform");
        addTeamMember(alice.accessToken(), teamId, bob.id());

        createTask(alice.accessToken(), "Matching task", "TODO", "HIGH", bob.id(), teamId);
        createTask(alice.accessToken(), "Different status", "IN_PROGRESS", "HIGH", bob.id(), teamId);
        createTask(alice.accessToken(), "Different priority", "TODO", "LOW", bob.id(), teamId);
        createTask(alice.accessToken(), "Different assignee", "TODO", "HIGH", alice.id(), teamId);

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .param("status", "TODO")
                        .param("priority", "HIGH")
                        .param("assigneeId", Long.toString(bob.id())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Matching task"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void shouldRejectInvalidTaskListParameters() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .param("assigneeId", "0"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .param("size", "101"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .param("sort", "passwordHash,asc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Unsupported sort property: passwordHash"));

        mockMvc.perform(get("/tasks")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .param("status", "INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid request"))
                .andExpect(jsonPath("$.errors.status").exists());
    }

    private RegisteredUser registerAndLogin(String name, String email) throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "%s",
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(name, email, PASSWORD)))
                .andExpect(status().isCreated())
                .andReturn();

        Number userIdValue = JsonPath.read(registerResult.getResponse().getContentAsString(), "$.id");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
        return new RegisteredUser(userIdValue.longValue(), accessToken);
    }

    private long createTeam(String accessToken, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/teams")
                        .header(AUTHORIZATION, bearer(accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "%s"}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andReturn();

        Number teamId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
        return teamId.longValue();
    }

    private void addTeamMember(String accessToken, long teamId, long userId) throws Exception {
        mockMvc.perform(post("/teams/{id}/members", teamId)
                        .header(AUTHORIZATION, bearer(accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId": %d}
                                """.formatted(userId)))
                .andExpect(status().isOk());
    }

    private void createTask(
            String accessToken,
            String title,
            String status,
            String priority,
            Long assigneeId,
            long teamId
    ) throws Exception {
        mockMvc.perform(post("/tasks")
                        .header(AUTHORIZATION, bearer(accessToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody(title, status, priority, assigneeId, teamId)))
                .andExpect(status().isCreated());
    }

    private String taskBody(
            String title,
            String status,
            String priority,
            Long assigneeId,
            long teamId
    ) {
        String assignee = assigneeId == null ? "null" : assigneeId.toString();
        return """
                {
                  "title": "%s",
                  "description": "Task created by integration test",
                  "status": "%s",
                  "priority": "%s",
                  "assigneeId": %s,
                  "teamId": %d,
                  "dueDate": "2030-12-31"
                }
                """.formatted(title, status, priority, assignee, teamId);
    }

    private String bearer(String accessToken) {
        return "Bearer " + accessToken;
    }

    private record RegisteredUser(long id, String accessToken) {
    }
}
