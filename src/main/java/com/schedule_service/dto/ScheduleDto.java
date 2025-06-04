package com.schedule_service.dto;

import java.time.LocalDateTime;

import com.schedule_service.domain.ScheduleType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleDto {
    private String title;
    private String details;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ScheduleType type;
}