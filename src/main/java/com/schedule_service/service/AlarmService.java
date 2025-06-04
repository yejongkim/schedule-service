package com.schedule_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schedule_service.domain.Alarm;
import com.schedule_service.repository.AlarmRepository;
import com.schedule_service.repository.ScheduleRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AlarmService {
    private final AlarmRepository alarmRepository;
    private final ScheduleRepository scheduleRepository;

    public List<Alarm> findByScheduleId(Long scheduleId) {
        if (!scheduleRepository.existsById(scheduleId)) {
            throw new EntityNotFoundException("Schedule not found with id: " + scheduleId);
        }
        return alarmRepository.findByScheduleId(scheduleId);
    }

    public Alarm create(Long scheduleId, LocalDateTime alarmTime, boolean enabled) {
        if (!scheduleRepository.existsById(scheduleId)) {
            throw new EntityNotFoundException("Schedule not found with id: " + scheduleId);
        }
        
        Alarm alarm = new Alarm();
        alarm.setScheduleId(scheduleId);
        alarm.setAlarmTime(alarmTime);
        alarm.setEnabled(enabled);
        return alarmRepository.save(alarm);
    }

    public Alarm update(Long id, LocalDateTime alarmTime, boolean enabled) {
        Alarm alarm = alarmRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alarm not found with id: " + id));
        
        alarm.setAlarmTime(alarmTime);
        alarm.setEnabled(enabled);
        return alarmRepository.save(alarm);
    }

    public void delete(Long id) {
        if (!alarmRepository.existsById(id)) {
            throw new EntityNotFoundException("Alarm not found with id: " + id);
        }
        alarmRepository.deleteById(id);
    }
} 