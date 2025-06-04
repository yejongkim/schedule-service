// API 클래스 - Spring Boot 백엔드와 통신
class ScheduleAPI {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.headers = CONFIG.HEADERS;
    }

    // HTTP 요청 래퍼
    async request(url, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                headers: this.headers,
                ...options
            });

            // 응답 상태 확인
            if (!response.ok) {
                const error = new Error(`HTTP Error: ${response.status}`);
                error.status = response.status;
                error.statusText = response.statusText;
                
                // 에러 응답 본문이 있으면 파싱 시도
                try {
                    const errorData = await response.json();
                    error.message = errorData.message || error.message;
                } catch (e) {
                    // JSON 파싱 실패시 기본 메시지 사용
                }
                
                throw error;
            }

            // 응답 본문이 있으면 JSON으로 파싱, 없으면 null 반환
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return null;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // GET 요청
    async get(url) {
        return this.request(url, {
            method: 'GET'
        });
    }

    // POST 요청
    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT 요청
    async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE 요청
    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    // === 일정 관련 API 메서드들 ===

    // 모든 일정 조회
    async getAllSchedules() {
        return this.get(CONFIG.ENDPOINTS.SCHEDULES);
    }

    // 일정 ID로 조회
    async getScheduleById(id) {
        return this.get(CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id));
    }

    // 상태별 일정 조회
    async getSchedulesByStatus(status) {
        return this.get(CONFIG.ENDPOINTS.SCHEDULES_BY_STATUS(status));
    }

    // 날짜별 일정 조회
    async getSchedulesByDate(date) {
        return this.get(CONFIG.ENDPOINTS.SCHEDULES_BY_DATE(date));
    }

    // 일정 검색
    async searchSchedules(query) {
        return this.get(CONFIG.ENDPOINTS.SEARCH_SCHEDULES(query));
    }

    // 새 일정 생성
    async createSchedule(scheduleData) {
        // 날짜 형식 변환
        const formattedData = {
            ...scheduleData,
            startDate: UTILS.formatDateForAPI(scheduleData.startDate),
            endDate: UTILS.formatDateForAPI(scheduleData.endDate)
        };

        return this.post(CONFIG.ENDPOINTS.SCHEDULES, formattedData);
    }

    // 일정 수정
    async updateSchedule(id, scheduleData) {
        // 날짜 형식 변환
        const formattedData = {
            ...scheduleData,
            startDate: UTILS.formatDateForAPI(scheduleData.startDate),
            endDate: UTILS.formatDateForAPI(scheduleData.endDate)
        };

        return this.put(CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id), formattedData);
    }

    // 일정 삭제
    async deleteSchedule(id) {
        return this.delete(CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id));
    }

    // 일정 상태 변경
    async updateScheduleStatus(id, status) {
        return this.put(CONFIG.ENDPOINTS.SCHEDULE_BY_ID(id), { status });
    }

    // === 추가 기능 메서드들 ===

    // 필터링된 일정 조회 (복합 조건)
    async getFilteredSchedules(filters = {}) {
        let url = CONFIG.ENDPOINTS.SCHEDULES;
        const params = new URLSearchParams();

        // 상태 필터
        if (filters.status) {
            params.append('status', filters.status);
        }

        // 날짜 필터
        if (filters.date) {
            params.append('date', filters.date);
        }

        // 우선순위 필터
        if (filters.priority) {
            params.append('priority', filters.priority);
        }

        // 검색 쿼리
        if (filters.search) {
            params.append('search', filters.search);
        }

        // 정렬
        if (filters.sortBy) {
            params.append('sortBy', filters.sortBy);
        }

        if (filters.sortOrder) {
            params.append('sortOrder', filters.sortOrder);
        }

        // 페이지네이션
        if (filters.page) {
            params.append('page', filters.page);
        }

        if (filters.size) {
            params.append('size', filters.size);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return this.get(url);
    }

    // 오늘의 일정 조회
    async getTodaySchedules() {
        const today = new Date().toISOString().split('T')[0];
        return this.getSchedulesByDate(today);
    }

    // 이번 주 일정 조회
    async getThisWeekSchedules() {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        
        return this.getFilteredSchedules({
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: endOfWeek.toISOString().split('T')[0]
        });
    }

    // 일정 통계 조회
    async getScheduleStats() {
        // 백엔드에 통계 API가 있다면 사용, 없으면 프론트엔드에서 계산
        try {
            const schedules = await this.getAllSchedules();
            
            const stats = {
                total: schedules.length,
                pending: schedules.filter(s => s.status === 'PENDING').length,
                inProgress: schedules.filter(s => s.status === 'IN_PROGRESS').length,
                completed: schedules.filter(s => s.status === 'COMPLETED').length,
                cancelled: schedules.filter(s => s.status === 'CANCELLED').length,
                highPriority: schedules.filter(s => s.priority === 'HIGH').length,
                overdue: schedules.filter(s => {
                    const endDate = new Date(s.endDate);
                    const now = new Date();
                    return endDate < now && s.status !== 'COMPLETED' && s.status !== 'CANCELLED';
                }).length
            };

            return stats;
        } catch (error) {
            console.error('Failed to get schedule stats:', error);
            return {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
                highPriority: 0,
                overdue: 0
            };
        }
    }
}

// Mock API 클래스 - 백엔드가 없을 때 테스트용
class MockScheduleAPI {
    constructor() {
        // 로컬 스토리지에서 데이터 로드
        this.loadMockData();
    }

    loadMockData() {
        const saved = UTILS.storage.get('mock_schedules');
        if (saved) {
            this.schedules = saved;
        } else {
            // 기본 샘플 데이터
            this.schedules = [
                {
                    id: 1,
                    title: '프로젝트 회의',
                    description: '주간 프로젝트 진행상황 점검 회의',
                    startDate: new Date(Date.now() + 86400000).toISOString(), // 내일
                    endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 내일 + 1시간
                    status: 'PENDING',
                    priority: 'HIGH',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: '문서 작성',
                    description: 'API 문서 업데이트',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 7200000).toISOString(), // 2시간 후
                    status: 'IN_PROGRESS',
                    priority: 'MEDIUM',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveMockData();
        }
    }

    saveMockData() {
        UTILS.storage.set('mock_schedules', this.schedules);
    }

    // Mock API 메서드들 (실제 API와 동일한 인터페이스)
    async getAllSchedules() {
        await this.delay(300); // 네트워크 지연 시뮬레이션
        return [...this.schedules];
    }

    async getScheduleById(id) {
        await this.delay(200);
        const schedule = this.schedules.find(s => s.id === parseInt(id));
        if (!schedule) {
            throw new Error('Schedule not found');
        }
        return schedule;
    }

    async createSchedule(scheduleData) {
        await this.delay(500);
        const newSchedule = {
            id: Date.now(), // 간단한 ID 생성
            ...scheduleData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.schedules.push(newSchedule);
        this.saveMockData();
        return newSchedule;
    }

    async updateSchedule(id, scheduleData) {
        await this.delay(500);
        const index = this.schedules.findIndex(s => s.id === parseInt(id));
        if (index === -1) {
            throw new Error('Schedule not found');
        }
        this.schedules[index] = {
            ...this.schedules[index],
            ...scheduleData,
            updatedAt: new Date().toISOString()
        };
        this.saveMockData();
        return this.schedules[index];
    }

    async deleteSchedule(id) {
        await this.delay(300);
        const index = this.schedules.findIndex(s => s.id === parseInt(id));
        if (index === -1) {
            throw new Error('Schedule not found');
        }
        this.schedules.splice(index, 1);
        this.saveMockData();
        return true;
    }

    async searchSchedules(query) {
        await this.delay(400);
        const lowerQuery = query.toLowerCase();
        return this.schedules.filter(s => 
            s.title.toLowerCase().includes(lowerQuery) ||
            s.description.toLowerCase().includes(lowerQuery)
        );
    }

    async getSchedulesByStatus(status) {
        await this.delay(300);
        return this.schedules.filter(s => s.status === status);
    }

    // 지연 시뮬레이션
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// API 인스턴스 생성 및 전역 변수로 내보내기
const USE_MOCK_API = true; // 개발 중에는 true, 실제 배포시에는 false로 변경

const api = USE_MOCK_API ? new MockScheduleAPI() : new ScheduleAPI();

// 전역 변수로 내보내기
window.api = api; 