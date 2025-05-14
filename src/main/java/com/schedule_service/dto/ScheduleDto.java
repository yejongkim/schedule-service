package com.schedule_service.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ScheduleDto {
    private String title;
    private String details;
    private LocalDateTime alarmTime;
    private boolean alarmEnabled;
}