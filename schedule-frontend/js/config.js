// API 설정
const CONFIG = {
    // 백엔드 API 기본 URL (Spring Boot 서버)
    API_BASE_URL: 'http://localhost:8080/api',
    
    // API 엔드포인트
    ENDPOINTS: {
        SCHEDULES: '/schedules',
        SCHEDULE_BY_ID: (id) => `/schedules/${id}`,
        SCHEDULES_BY_STATUS: (status) => `/schedules/status/${status}`,
        SCHEDULES_BY_DATE: (date) => `/schedules/date/${date}`,
        SEARCH_SCHEDULES: (query) => `/schedules/search?q=${encodeURIComponent(query)}`
    },
    
    // HTTP 헤더
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // 상태 코드 매핑
    STATUS: {
        PENDING: { key: 'PENDING', label: '대기중', class: 'status-pending' },
        IN_PROGRESS: { key: 'IN_PROGRESS', label: '진행중', class: 'status-in-progress' },
        COMPLETED: { key: 'COMPLETED', label: '완료', class: 'status-completed' },
        CANCELLED: { key: 'CANCELLED', label: '취소', class: 'status-cancelled' }
    },
    
    // 우선순위 매핑
    PRIORITY: {
        LOW: { key: 'LOW', label: '낮음', class: 'priority-low' },
        MEDIUM: { key: 'MEDIUM', label: '보통', class: 'priority-medium' },
        HIGH: { key: 'HIGH', label: '높음', class: 'priority-high' }
    },
    
    // 날짜 포맷
    DATE_FORMAT: {
        DISPLAY: 'YYYY-MM-DD HH:mm',
        API: 'YYYY-MM-DDTHH:mm:ss'
    },
    
    // 페이지네이션
    PAGINATION: {
        DEFAULT_SIZE: 10,
        MAX_SIZE: 100
    },
    
    // 로컬 스토리지 키
    STORAGE_KEYS: {
        FILTERS: 'schedule_filters',
        LAST_REFRESH: 'schedule_last_refresh'
    },
    
    // 메시지
    MESSAGES: {
        SUCCESS: {
            CREATE: '일정이 성공적으로 추가되었습니다.',
            UPDATE: '일정이 성공적으로 수정되었습니다.',
            DELETE: '일정이 성공적으로 삭제되었습니다.'
        },
        ERROR: {
            NETWORK: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
            SERVER: '서버 오류가 발생했습니다. 관리자에게 문의하세요.',
            VALIDATION: '입력 정보를 확인해주세요.',
            NOT_FOUND: '요청한 일정을 찾을 수 없습니다.',
            UNAUTHORIZED: '권한이 없습니다.',
            UNKNOWN: '알 수 없는 오류가 발생했습니다.'
        },
        CONFIRM: {
            DELETE: '정말로 이 일정을 삭제하시겠습니까?'
        }
    }
};

// 유틸리티 함수들
const UTILS = {
    // 날짜 포맷팅
    formatDate: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // API 날짜 포맷
    formatDateForAPI: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19);
    },
    
    // 로컬 날짜 시간 입력 포맷
    formatDateForInput: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    },
    
    // 상태 정보 가져오기
    getStatusInfo: (status) => {
        return CONFIG.STATUS[status] || { key: status, label: status, class: 'status-pending' };
    },
    
    // 우선순위 정보 가져오기
    getPriorityInfo: (priority) => {
        return CONFIG.PRIORITY[priority] || { key: priority, label: priority, class: 'priority-medium' };
    },
    
    // 디바운스 함수
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 로컬 스토리지 헬퍼
    storage: {
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Storage get error:', e);
                return null;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        }
    },
    
    // 에러 처리
    handleError: (error, defaultMessage = CONFIG.MESSAGES.ERROR.UNKNOWN) => {
        console.error('Error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return CONFIG.MESSAGES.ERROR.NETWORK;
        }
        
        if (error.status) {
            switch (error.status) {
                case 400:
                    return CONFIG.MESSAGES.ERROR.VALIDATION;
                case 401:
                    return CONFIG.MESSAGES.ERROR.UNAUTHORIZED;
                case 404:
                    return CONFIG.MESSAGES.ERROR.NOT_FOUND;
                case 500:
                    return CONFIG.MESSAGES.ERROR.SERVER;
                default:
                    return error.message || defaultMessage;
            }
        }
        
        return error.message || defaultMessage;
    },
    
    // 알림 표시
    showNotification: (message, type = 'info') => {
        // 간단한 알림 시스템 (실제 구현에서는 더 정교한 토스트 라이브러리 사용 가능)
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 스타일링
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#e53e3e' : type === 'success' ? '#38a169' : '#4299e1',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        document.body.appendChild(notification);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
};

// 전역 변수로 내보내기
window.CONFIG = CONFIG;
window.UTILS = UTILS; 