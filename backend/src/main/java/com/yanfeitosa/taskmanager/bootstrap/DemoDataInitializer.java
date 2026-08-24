package com.yanfeitosa.taskmanager.bootstrap;

import com.yanfeitosa.taskmanager.task.Task;
import com.yanfeitosa.taskmanager.task.TaskPriority;
import com.yanfeitosa.taskmanager.task.TaskRepository;
import com.yanfeitosa.taskmanager.task.TaskStatus;
import com.yanfeitosa.taskmanager.team.Team;
import com.yanfeitosa.taskmanager.team.TeamRepository;
import com.yanfeitosa.taskmanager.user.User;
import com.yanfeitosa.taskmanager.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Component
@ConditionalOnProperty(prefix = "app.demo-data", name = "enabled", havingValue = "true")
public class DemoDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;
    private final String password;

    public DemoDataInitializer(
            UserRepository userRepository,
            TeamRepository teamRepository,
            TaskRepository taskRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.demo-data.password}") String password
    ) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        User ana = findOrCreateUser("Ana Souza", "ana@taskmanager.local");
        User bruno = findOrCreateUser("Bruno Lima", "bruno@taskmanager.local");
        User carla = findOrCreateUser("Carla Mendes", "carla@taskmanager.local");
        User diego = findOrCreateUser("Diego Rocha", "diego@taskmanager.local");

        Team productTeam = findOrCreateTeam("Produto", ana, bruno, carla);
        Team operationsTeam = findOrCreateTeam("Operações", bruno, diego);

        createTasks(productTeam, operationsTeam, ana, bruno, carla, diego);
    }

    private User findOrCreateUser(String name, String email) {
        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        return userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> userRepository.save(
                        new User(name, normalizedEmail, passwordEncoder.encode(password))
                ));
    }

    private Team findOrCreateTeam(String name, User... members) {
        Team team = teamRepository.findAll().stream()
                .filter(existingTeam -> existingTeam.getName().equals(name))
                .findFirst()
                .orElseGet(() -> new Team(name));

        Arrays.stream(members).forEach(team::addMember);
        return teamRepository.save(team);
    }

    private void createTasks(
            Team productTeam,
            Team operationsTeam,
            User ana,
            User bruno,
            User carla,
            User diego
    ) {
        Set<String> existingTitles = new HashSet<>();
        taskRepository.findAll().forEach(task -> existingTitles.add(task.getTitle()));

        saveIfMissing(existingTitles, new Task(
                "Definir escopo do dashboard",
                "Organizar os requisitos iniciais e alinhar o escopo com o time.",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                null,
                productTeam,
                LocalDate.now().plusDays(5)
        ));
        saveIfMissing(existingTitles, new Task(
                "Implementar autenticação",
                "Finalizar o fluxo de login e validar a expiração da sessão.",
                TaskStatus.IN_PROGRESS,
                TaskPriority.HIGH,
                bruno,
                productTeam,
                LocalDate.now().plusDays(3)
        ));
        saveIfMissing(existingTitles, new Task(
                "Revisar fluxo de tarefas",
                "Validar criação, edição e conclusão de tarefas.",
                TaskStatus.COMPLETED,
                TaskPriority.MEDIUM,
                carla,
                productTeam,
                LocalDate.now().minusDays(1)
        ));
        saveIfMissing(existingTitles, new Task(
                "Atualizar documentação",
                "Registrar instruções de execução e decisões técnicas.",
                TaskStatus.TODO,
                TaskPriority.LOW,
                ana,
                productTeam,
                LocalDate.now().plusDays(10)
        ));
        saveIfMissing(existingTitles, new Task(
                "Configurar ambiente de homologação",
                "Preparar as configurações necessárias para validação interna.",
                TaskStatus.IN_PROGRESS,
                TaskPriority.HIGH,
                diego,
                operationsTeam,
                LocalDate.now().plusDays(4)
        ));
        saveIfMissing(existingTitles, new Task(
                "Validar rotina de backup",
                "Executar e conferir a restauração do backup do banco.",
                TaskStatus.COMPLETED,
                TaskPriority.MEDIUM,
                bruno,
                operationsTeam,
                LocalDate.now().minusDays(2)
        ));
        saveIfMissing(existingTitles, new Task(
                "Mapear alertas operacionais",
                "Definir os alertas essenciais para o acompanhamento do ambiente.",
                TaskStatus.TODO,
                TaskPriority.LOW,
                null,
                operationsTeam,
                null
        ));
    }

    private void saveIfMissing(Set<String> existingTitles, Task task) {
        if (existingTitles.add(task.getTitle())) {
            taskRepository.save(task);
        }
    }
}
