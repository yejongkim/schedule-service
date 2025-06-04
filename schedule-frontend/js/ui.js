// UI 관리 클래스
class ScheduleUI {
    constructor() {
        this.currentSchedules = [];
        this.currentFilters = {
            status: '',
            date: '',
            search: ''
        };
        this.editingScheduleId = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    // DOM 요소 초기화
    initializeElements() {
        // 주요 컨테이너
        this.scheduleList = document.getElementById('scheduleList');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.emptyState = document.getElementById('emptyState');
        
        // 필터 요소들
        this.statusFilter = document.getElementById('statusFilter');
        this.dateFilter = document.getElementById('dateFilter');
        this.searchInput = document.getElementById('searchInput');
        
        // 모달 요소들
        this.modal = document.getElementById('scheduleModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.scheduleForm = document.getElementById('scheduleForm');
        
        // 버튼들
        this.addScheduleBtn = document.getElementById('addScheduleBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        
        // 폼 입력 요소들
        this.titleInput = document.getElementById('title');
        this.descriptionInput = document.getElementById('description');
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');
        this.statusSelect = document.getElementById('status');
        this.prioritySelect = document.getElementById('priority');
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 일정 추가 버튼
        this.addScheduleBtn.addEventListener('click', () => this.openModal());
        
        // 모달 닫기
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // 모달 오버레이 클릭시 닫기
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
        
        // 폼 제출
        this.scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // 필터 이벤트
        this.statusFilter.addEventListener('change', () => this.handleFilterChange());
        this.dateFilter.addEventListener('change', () => this.handleFilterChange());
        
        // 검색 입력 (디바운스 적용)
        this.searchInput.addEventListener('input', 
            UTILS.debounce(() => this.handleFilterChange(), 300)
        );
    }

    // === 모달 관리 ===
    
    openModal(schedule = null) {
        this.editingScheduleId = schedule ? schedule.id : null;
        this.modalTitle.textContent = schedule ? '일정 수정' : '일정 추가';
        
        if (schedule) {
            this.populateForm(schedule);
        } else {
            this.clearForm();
        }
        
        this.modal.style.display = 'block';
        this.titleInput.focus();
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.clearForm();
        this.editingScheduleId = null;
    }

    // 폼 데이터로 채우기
    populateForm(schedule) {
        this.titleInput.value = schedule.title || '';
        this.descriptionInput.value = schedule.description || '';
        this.startDateInput.value = UTILS.formatDateForInput(schedule.startDate);
        this.endDateInput.value = UTILS.formatDateForInput(schedule.endDate);
        this.statusSelect.value = schedule.status || 'PENDING';
        this.prioritySelect.value = schedule.priority || 'MEDIUM';
    }

    // 폼 초기화
    clearForm() {
        this.scheduleForm.reset();
        this.statusSelect.value = 'PENDING';
        this.prioritySelect.value = 'MEDIUM';
    }

    // === 일정 렌더링 ===
    
    async renderSchedules(schedules = null) {
        if (schedules === null) {
            schedules = this.currentSchedules;
        } else {
            this.currentSchedules = schedules;
        }

        // 로딩 상태 숨기기
        this.hideLoading();

        // 스케줄이 없으면 빈 상태 표시
        if (!schedules || schedules.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        // 일정 목록 렌더링
        this.scheduleList.innerHTML = schedules.map(schedule => 
            this.createScheduleHTML(schedule)
        ).join('');

        // 이벤트 리스너 다시 바인딩
        this.bindScheduleEvents();
    }

    // 개별 일정 HTML 생성
    createScheduleHTML(schedule) {
        const statusInfo = UTILS.getStatusInfo(schedule.status);
        const priorityInfo = UTILS.getPriorityInfo(schedule.priority);
        
        return `
            <div class="schedule-item priority-${schedule.priority.toLowerCase()}" data-id="${schedule.id}">
                <div class="schedule-header">
                    <div>
                        <h3 class="schedule-title">${this.escapeHtml(schedule.title)}</h3>
                        <div class="schedule-meta">
                            <span><i class="fas fa-calendar"></i> ${UTILS.formatDate(schedule.startDate)}</span>
                            <span><i class="fas fa-clock"></i> ${UTILS.formatDate(schedule.endDate)}</span>
                            <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
                            <span class="priority-badge ${priorityInfo.class}">${priorityInfo.label}</span>
                        </div>
                    </div>
                    <div class="schedule-actions">
                        <button class="btn btn-sm btn-edit" onclick="ui.editSchedule(${schedule.id})">
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="ui.deleteSchedule(${schedule.id})">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </div>
                ${schedule.description ? `<p class="schedule-description">${this.escapeHtml(schedule.description)}</p>` : ''}
            </div>
        `;
    }

    // 일정 관련 이벤트 바인딩
    bindScheduleEvents() {
        // 상태 변경 이벤트는 필요시 추가
    }

    // === 필터링 ===
    
    handleFilterChange() {
        this.currentFilters = {
            status: this.statusFilter.value,
            date: this.dateFilter.value,
            search: this.searchInput.value.trim()
        };
        
        // 필터 상태 저장
        UTILS.storage.set(CONFIG.STORAGE_KEYS.FILTERS, this.currentFilters);
        
        // 필터링된 일정 로드
        this.loadSchedules();
    }

    // 저장된 필터 복원
    restoreFilters() {
        const savedFilters = UTILS.storage.get(CONFIG.STORAGE_KEYS.FILTERS);
        if (savedFilters) {
            this.currentFilters = savedFilters;
            this.statusFilter.value = savedFilters.status || '';
            this.dateFilter.value = savedFilters.date || '';
            this.searchInput.value = savedFilters.search || '';
        }
    }

    // === API 호출 및 데이터 관리 ===
    
    async loadSchedules() {
        try {
            this.showLoading();
            
            let schedules;
            
            // 필터에 따라 다른 API 호출
            if (this.currentFilters.search) {
                schedules = await api.searchSchedules(this.currentFilters.search);
            } else if (this.currentFilters.status) {
                schedules = await api.getSchedulesByStatus(this.currentFilters.status);
            } else if (this.currentFilters.date) {
                schedules = await api.getSchedulesByDate(this.currentFilters.date);
            } else {
                schedules = await api.getAllSchedules();
            }
            
            // 클라이언트 사이드 추가 필터링 (필요한 경우)
            schedules = this.applyClientSideFilters(schedules);
            
            await this.renderSchedules(schedules);
            
        } catch (error) {
            console.error('Failed to load schedules:', error);
            this.hideLoading();
            UTILS.showNotification(UTILS.handleError(error), 'error');
        }
    }

    // 클라이언트 사이드 필터링
    applyClientSideFilters(schedules) {
        let filtered = [...schedules];
        
        // 상태 필터 (서버에서 처리되지 않은 경우)
        if (this.currentFilters.status) {
            filtered = filtered.filter(s => s.status === this.currentFilters.status);
        }
        
        // 날짜 필터 (서버에서 처리되지 않은 경우)
        if (this.currentFilters.date) {
            const filterDate = new Date(this.currentFilters.date).toDateString();
            filtered = filtered.filter(s => {
                const scheduleDate = new Date(s.startDate).toDateString();
                return scheduleDate === filterDate;
            });
        }
        
        // 검색 필터 (서버에서 처리되지 않은 경우)
        if (this.currentFilters.search) {
            const query = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(s => 
                s.title.toLowerCase().includes(query) ||
                (s.description && s.description.toLowerCase().includes(query))
            );
        }
        
        return filtered;
    }

    // === 폼 처리 ===
    
    async handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            // 폼 검증
            if (!this.validateForm(formData)) {
                return;
            }
            
            this.saveBtn.disabled = true;
            this.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
            
            let result;
            if (this.editingScheduleId) {
                result = await api.updateSchedule(this.editingScheduleId, formData);
                UTILS.showNotification(CONFIG.MESSAGES.SUCCESS.UPDATE, 'success');
            } else {
                result = await api.createSchedule(formData);
                UTILS.showNotification(CONFIG.MESSAGES.SUCCESS.CREATE, 'success');
            }
            
            this.closeModal();
            await this.loadSchedules();
            
        } catch (error) {
            console.error('Form submit error:', error);
            UTILS.showNotification(UTILS.handleError(error), 'error');
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.innerHTML = '저장';
        }
    }

    // 폼 데이터 수집
    getFormData() {
        return {
            title: this.titleInput.value.trim(),
            description: this.descriptionInput.value.trim(),
            startDate: this.startDateInput.value,
            endDate: this.endDateInput.value,
            status: this.statusSelect.value,
            priority: this.prioritySelect.value
        };
    }

    // 폼 검증
    validateForm(data) {
        // 필수 필드 검증
        if (!data.title) {
            UTILS.showNotification('제목을 입력해주세요.', 'error');
            this.titleInput.focus();
            return false;
        }
        
        if (!data.startDate) {
            UTILS.showNotification('시작일을 선택해주세요.', 'error');
            this.startDateInput.focus();
            return false;
        }
        
        if (!data.endDate) {
            UTILS.showNotification('종료일을 선택해주세요.', 'error');
            this.endDateInput.focus();
            return false;
        }
        
        // 날짜 검증
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        if (endDate <= startDate) {
            UTILS.showNotification('종료일은 시작일보다 늦어야 합니다.', 'error');
            this.endDateInput.focus();
            return false;
        }
        
        return true;
    }

    // === 일정 관리 액션 ===
    
    async editSchedule(id) {
        try {
            const schedule = await api.getScheduleById(id);
            this.openModal(schedule);
        } catch (error) {
            console.error('Failed to load schedule for editing:', error);
            UTILS.showNotification(UTILS.handleError(error), 'error');
        }
    }

    async deleteSchedule(id) {
        if (!confirm(CONFIG.MESSAGES.CONFIRM.DELETE)) {
            return;
        }
        
        try {
            await api.deleteSchedule(id);
            UTILS.showNotification(CONFIG.MESSAGES.SUCCESS.DELETE, 'success');
            await this.loadSchedules();
        } catch (error) {
            console.error('Failed to delete schedule:', error);
            UTILS.showNotification(UTILS.handleError(error), 'error');
        }
    }

    // === UI 상태 관리 ===
    
    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.scheduleList.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
        this.scheduleList.style.display = 'block';
    }

    showEmptyState() {
        this.emptyState.style.display = 'block';
        this.scheduleList.style.display = 'none';
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
        this.scheduleList.style.display = 'block';
    }

    // === 유틸리티 ===
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === 초기화 ===
    
    async initialize() {
        try {
            this.restoreFilters();
            await this.loadSchedules();
        } catch (error) {
            console.error('Failed to initialize UI:', error);
            UTILS.showNotification('애플리케이션 초기화에 실패했습니다.', 'error');
        }
    }
}

// UI 인스턴스 생성 및 전역 변수로 내보내기
const ui = new ScheduleUI();
window.ui = ui; 