package com.schedule_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schedule_service.domain.Schedule;
import com.schedule_service.dto.ScheduleDto;
import com.schedule_service.repository.ScheduleRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;

    public List<Schedule> findAll() {
        return scheduleRepository.findAll();
    }

    public Schedule findById(Long id) {
        return scheduleRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + id));
    }

    public Schedule create(ScheduleDto dto) {
        Schedule schedule = new Schedule();
        schedule.setTitle(dto.getTitle());
        schedule.setDetails(dto.getDetails());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setType(dto.getType());
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());
        return scheduleRepository.save(schedule);
    }

    public Schedule update(Long id, ScheduleDto dto) {
        Schedule schedule = findById(id);
        schedule.setTitle(dto.getTitle());
        schedule.setDetails(dto.getDetails());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setType(dto.getType());
        schedule.setUpdatedAt(LocalDateTime.now());
        return scheduleRepository.save(schedule);
    }

    public void delete(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new EntityNotFoundException("Schedule not found with id: " + id);
        }
        scheduleRepository.deleteById(id);
    }
}


