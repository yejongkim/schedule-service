package com.schedule_service.service;

import com.schedule_service.domain.Schedule;
import com.schedule_service.dto.ScheduleDto;
import com.schedule_service.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;

    public List<Schedule> findAll() {
        return scheduleRepository.findAll();
    }

    public Schedule findById(Long id) {
        return scheduleRepository.findById(id).orElse(null);
    }

    public Schedule create(ScheduleDto dto) {
        Schedule schedule = new Schedule();
        schedule.setTitle(dto.getTitle());
        schedule.setDetails(dto.getDetails());
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());
        schedule.setAlarmTime(dto.getAlarmTime());
        schedule.setAlarmEnabled(dto.isAlarmEnabled());
        return scheduleRepository.save(schedule);
    }

    public Schedule update(Long id, ScheduleDto dto) {
        Optional<Schedule> optional = scheduleRepository.findById(id);
        if (optional.isPresent()) {
            Schedule schedule = optional.get();
            schedule.setTitle(dto.getTitle());
            schedule.setDetails(dto.getDetails());
            schedule.setUpdatedAt(LocalDateTime.now());
            schedule.setAlarmTime(dto.getAlarmTime());
            schedule.setAlarmEnabled(dto.isAlarmEnabled());
            return scheduleRepository.save(schedule);
        }
        return null;
    }

    public void delete(Long id) {
        scheduleRepository.deleteById(id);
    }

    public Schedule setAlarm(Long id, LocalDateTime alarmTime, boolean enabled) {
        Optional<Schedule> optional = scheduleRepository.findById(id);
        if (optional.isPresent()) {
            Schedule schedule = optional.get();
            schedule.setAlarmTime(alarmTime);
            schedule.setAlarmEnabled(enabled);
            schedule.setUpdatedAt(LocalDateTime.now());
            return scheduleRepository.save(schedule);
        }
        return null;
    }
}


