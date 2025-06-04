// 메인 애플리케이션 클래스
class ScheduleApp {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
    }

    // 애플리케이션 초기화
    async initialize() {
        try {
            console.log('Schedule Service 초기화 중...');
            
            // DOM이 완전히 로드될 때까지 대기
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initialize());
                return;
            }

            // 이미 초기화된 경우 중복 실행 방지
            if (this.isInitialized) {
                return;
            }

            // 전역 에러 핸들러 설정
            this.setupGlobalErrorHandlers();

            // UI 초기화
            await ui.initialize();

            // 자동 새로고침 설정 (선택사항)
            this.setupAutoRefresh();

            // 키보드 단축키 설정
            this.setupKeyboardShortcuts();

            // 초기화 완료
            this.isInitialized = true;
            console.log('Schedule Service 초기화 완료');

            // 초기화 완료 알림
            UTILS.showNotification('Schedule Service가 준비되었습니다!', 'success');

        } catch (error) {
            console.error('애플리케이션 초기화 실패:', error);
            UTILS.showNotification('애플리케이션 초기화에 실패했습니다. 페이지를 새로고침해주세요.', 'error');
        }
    }

    // 전역 에러 핸들러 설정
    setupGlobalErrorHandlers() {
        // JavaScript 에러 처리
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            UTILS.showNotification('예기치 않은 오류가 발생했습니다.', 'error');
        });

        // Promise rejection 처리
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            UTILS.showNotification('처리되지 않은 오류가 발생했습니다.', 'error');
            event.preventDefault();
        });

        // 네트워크 상태 변화 감지
        window.addEventListener('online', () => {
            UTILS.showNotification('네트워크 연결이 복구되었습니다.', 'success');
            this.refreshData();
        });

        window.addEventListener('offline', () => {
            UTILS.showNotification('네트워크 연결이 끊어졌습니다.', 'error');
        });
    }

    // 자동 새로고침 설정
    setupAutoRefresh() {
        // 5분마다 자동으로 데이터 새로고침 (선택사항)
        const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

        this.refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                console.log('자동 새로고침 실행');
                this.refreshData();
            }
        }, AUTO_REFRESH_INTERVAL);

        // 페이지가 다시 활성화될 때 새로고침
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                const lastRefresh = UTILS.storage.get(CONFIG.STORAGE_KEYS.LAST_REFRESH);
                const now = Date.now();
                
                // 마지막 새로고침으로부터 2분 이상 지났으면 새로고침
                if (!lastRefresh || (now - lastRefresh) > 2 * 60 * 1000) {
                    this.refreshData();
                }
            }
        });
    }

    // 키보드 단축키 설정
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + N: 새 일정 추가
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                ui.openModal();
            }

            // Ctrl/Cmd + R: 새로고침
            if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                event.preventDefault();
                this.refreshData();
            }

            // F5: 새로고침
            if (event.key === 'F5') {
                event.preventDefault();
                this.refreshData();
            }
        });
    }

    // 데이터 새로고침
    async refreshData() {
        try {
            console.log('데이터 새로고침 중...');
            await ui.loadSchedules();
            
            // 마지막 새로고침 시간 저장
            UTILS.storage.set(CONFIG.STORAGE_KEYS.LAST_REFRESH, Date.now());
            
            console.log('데이터 새로고침 완료');
        } catch (error) {
            console.error('데이터 새로고침 실패:', error);
            UTILS.showNotification('데이터 새로고침에 실패했습니다.', 'error');
        }
    }

    // 애플리케이션 종료 시 정리
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // 개발자 도구용 헬퍼 메서드들
    async getStats() {
        try {
            if (api.getScheduleStats) {
                return await api.getScheduleStats();
            } else {
                const schedules = await api.getAllSchedules();
                return {
                    total: schedules.length,
                    pending: schedules.filter(s => s.status === 'PENDING').length,
                    inProgress: schedules.filter(s => s.status === 'IN_PROGRESS').length,
                    completed: schedules.filter(s => s.status === 'COMPLETED').length,
                    cancelled: schedules.filter(s => s.status === 'CANCELLED').length
                };
            }
        } catch (error) {
            console.error('Failed to get stats:', error);
            return null;
        }
    }

    // 디버그 정보 출력
    debugInfo() {
        console.log('=== Schedule Service Debug Info ===');
        console.log('Initialized:', this.isInitialized);
        console.log('Current Schedules:', ui.currentSchedules);
        console.log('Current Filters:', ui.currentFilters);
        console.log('API Instance:', api);
        console.log('Config:', CONFIG);
        console.log('==================================');
    }

    // 샘플 데이터 생성 (개발/테스트용)
    async generateSampleData() {
        const sampleSchedules = [
            {
                title: '팀 미팅',
                description: '주간 팀 미팅 및 프로젝트 리뷰',
                startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // 내일
                endDate: new Date(Date.now() + 86400000 + 3600000).toISOString().slice(0, 16), // 내일 + 1시간
                status: 'PENDING',
                priority: 'HIGH'
            },
            {
                title: '문서 작성',
                description: '프로젝트 문서 업데이트',
                startDate: new Date().toISOString().slice(0, 16), // 지금
                endDate: new Date(Date.now() + 7200000).toISOString().slice(0, 16), // 2시간 후
                status: 'IN_PROGRESS',
                priority: 'MEDIUM'
            },
            {
                title: '코드 리뷰',
                description: '신규 기능 코드 리뷰',
                startDate: new Date(Date.now() + 172800000).toISOString().slice(0, 16), // 모레
                endDate: new Date(Date.now() + 172800000 + 1800000).toISOString().slice(0, 16), // 모레 + 30분
                status: 'PENDING',
                priority: 'LOW'
            }
        ];

        try {
            for (const schedule of sampleSchedules) {
                await api.createSchedule(schedule);
            }
            UTILS.showNotification('샘플 데이터가 생성되었습니다.', 'success');
            await this.refreshData();
        } catch (error) {
            console.error('Failed to generate sample data:', error);
            UTILS.showNotification('샘플 데이터 생성에 실패했습니다.', 'error');
        }
    }

    // 모든 데이터 삭제 (개발/테스트용)
    async clearAllData() {
        if (!confirm('정말로 모든 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            const schedules = await api.getAllSchedules();
            for (const schedule of schedules) {
                await api.deleteSchedule(schedule.id);
            }
            UTILS.showNotification('모든 데이터가 삭제되었습니다.', 'success');
            await this.refreshData();
        } catch (error) {
            console.error('Failed to clear all data:', error);
            UTILS.showNotification('데이터 삭제에 실패했습니다.', 'error');
        }
    }
}

// 앱 인스턴스 생성
const app = new ScheduleApp();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// 앱 초기화 시작
app.initialize();

// 개발자 도구용 전역 함수들
window.scheduleApp = app;
window.generateSampleData = () => app.generateSampleData();
window.clearAllData = () => app.clearAllData();
window.debugInfo = () => app.debugInfo();
window.getStats = () => app.getStats();

// 개발 모드에서만 사용할 수 있는 기능들
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('=== Schedule Service Development Mode ===');
    console.log('사용 가능한 개발자 명령어:');
    console.log('- generateSampleData(): 샘플 데이터 생성');
    console.log('- clearAllData(): 모든 데이터 삭제');
    console.log('- debugInfo(): 디버그 정보 출력');
    console.log('- getStats(): 통계 정보 조회');
    console.log('=========================================');
} 