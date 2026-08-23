package com.yanfeitosa.taskmanager.team;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TeamControllerIntegrationTests {

    private static final String PASSWORD = "strong-password";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateTeamAndManageItsMembers() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");
        RegisteredUser bob = registerAndLogin("Bob", "bob@example.com");

        MvcResult createResult = mockMvc.perform(post("/teams")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Platform"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Platform"))
                .andExpect(jsonPath("$.members.length()").value(1))
                .andExpect(jsonPath("$.members[0].email").value("alice@example.com"))
                .andReturn();

        Number teamIdValue = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
        long teamId = teamIdValue.longValue();

        mockMvc.perform(post("/teams/{id}/members", teamId)
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId": %d}
                                """.formatted(bob.id())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.members.length()").value(2))
                .andExpect(jsonPath("$.members[1].email").value("bob@example.com"));

        mockMvc.perform(get("/teams/{id}", teamId)
                        .header(AUTHORIZATION, bearer(alice.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teamId))
                .andExpect(jsonPath("$.members.length()").value(2));

        mockMvc.perform(get("/teams")
                        .header(AUTHORIZATION, bearer(bob.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(teamId));
    }

    @Test
    void shouldHideTeamFromUsersWhoAreNotMembers() throws Exception {
        RegisteredUser alice = registerAndLogin("Alice", "alice@example.com");
        RegisteredUser bob = registerAndLogin("Bob", "bob@example.com");

        MvcResult createResult = mockMvc.perform(post("/teams")
                        .header(AUTHORIZATION, bearer(alice.accessToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Private Team"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Number teamIdValue = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
        long teamId = teamIdValue.longValue();

        mockMvc.perform(get("/teams")
                        .header(AUTHORIZATION, bearer(bob.accessToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/teams/{id}", teamId)
                        .header(AUTHORIZATION, bearer(bob.accessToken())))
                .andExpect(status().isNotFound());
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

    private String bearer(String accessToken) {
        return "Bearer " + accessToken;
    }

    private record RegisteredUser(long id, String accessToken) {
    }
}
