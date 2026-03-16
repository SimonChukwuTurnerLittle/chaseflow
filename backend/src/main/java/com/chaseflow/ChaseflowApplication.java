package com.chaseflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChaseflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChaseflowApplication.class, args);
    }
}
