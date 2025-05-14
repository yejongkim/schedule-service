package com.schedule_service.controller;

import com.schedule_service.domain.Schedule;
import com.schedule_service.dto.ScheduleDto;
import com.schedule_service.repository.ScheduleRepository;
import com.schedule_service.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor

public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping()
    public ResponseEntity<?> findAll() {
        List<Schedule>findList = scheduleService.findAll();
        return new ResponseEntity<>(findList, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        Schedule schedule = scheduleService.findById(id);
        return new ResponseEntity<>(schedule, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<Schedule> create(@RequestBody ScheduleDto dto) {
        Schedule created = scheduleService.create(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> update(@PathVariable Long id, @RequestBody ScheduleDto dto) {
        Schedule updated = scheduleService.update(id, dto);
        if (updated == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/alarm")
    public ResponseEntity<Schedule> setAlarm(@PathVariable Long id, @RequestParam LocalDateTime alarmTime, @RequestParam boolean enabled) {
        Schedule updated = scheduleService.setAlarm(id, alarmTime, enabled);
        if (updated == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }




}
