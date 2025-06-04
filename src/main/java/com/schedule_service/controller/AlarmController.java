package com.schedule_service.controller;

import com.schedule_service.domain.Alarm;
import com.schedule_service.service.AlarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/alarm")
@RequiredArgsConstructor
public class AlarmController {
    private final AlarmService alarmService;

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<Alarm>> findByScheduleId(@PathVariable Long scheduleId) {
        try {
            return ResponseEntity.ok(alarmService.findByScheduleId(scheduleId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/schedule/{scheduleId}")
    public ResponseEntity<Alarm> create(
            @PathVariable Long scheduleId,
            @RequestParam LocalDateTime alarmTime,
            @RequestParam boolean enabled) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(alarmService.create(scheduleId, alarmTime, enabled));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alarm> update(
            @PathVariable Long id,
            @RequestParam LocalDateTime alarmTime,
            @RequestParam boolean enabled) {
        try {
            return ResponseEntity.ok(alarmService.update(id, alarmTime, enabled));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            alarmService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 