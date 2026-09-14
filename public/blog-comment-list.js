/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
Description  : Import wizard - step navigation, column mapping and validation preview.
*/
(function () {
	"use strict";

	var root = document.querySelector('.import-wizard');
	if (!root) return;

	// -----------------------------------------------------------------
	// Demo data. In a real build these come from parsing the uploaded
	// file server-side; the shapes below are what the UI expects.
	// -----------------------------------------------------------------
	var SAMPLE_COLUMNS = [
		{ column: 'first_name', sample: 'Marcus', suggested: 'first_name' },
		{ column: 'last_name', sample: 'Whitfield', suggested: 'last_name' },
		{ column: 'work_email', sample: 'm.whitfield@northwind.io', suggested: 'email' },
		{ column: 'phone', sample: '+1 415 555 0134', suggested: 'phone' },
		{ column: 'org', sample: 'Northwind Logistics', suggested: 'company' },
		{ column: 'title', sample: 'VP Operations', suggested: 'job_title' },
		{ column: 'source', sample: 'Webinar', suggested: 'lead_source' },
		{ column: 'est_value', sample: '48000', suggested: 'deal_value' },
		{ column: 'notes', sample: 'Asked for Q3 pricing', suggested: '' }
	];

	// CRM fields available as mapping targets. required: blocks step 2.
	var CRM_FIELDS = [
		{ id: 'first_name', label: 'First Name', required: true },
		{ id: 'last_name', label: 'Last Name', required: true },
		{ id: 'email', label: 'Email Address', required: true },
		{ id: 'phone', label: 'Phone' },
		{ id: 'company', label: 'Company' },
		{ id: 'job_title', label: 'Job Title' },
		{ id: 'lead_source', label: 'Lead Source' },
		{ id: 'lead_status', label: 'Lead Status' },
		{ id: 'owner', label: 'Assigned Owner' },
		{ id: 'deal_value', label: 'Deal Value' },
		{ id: 'country', label: 'Country' },
		{ id: 'tags', label: 'Tags' },
		{ id: 'notes', label: 'Notes' }
	];

	var VALIDATION_ROWS = [
		{ row: 14, column: 'work_email', value: 'jordan.reyes@', issue: 'Not a valid email address', level: 'error' },
		{ row: 27, column: 'est_value', value: '12,400 USD', issue: 'Expected a number - currency text will be stripped', level: 'warning' },
		{ row: 33, column: 'work_email', value: 'a.pastore@meridian.co', issue: 'Matches an existing contact', level: 'warning' },
		{ row: 48, column: 'phone', value: '555', issue: 'Too short to be a valid phone number', level: 'warning' },
		{ row: 61, column: 'work_email', value: '', issue: 'Required field is empty', level: 'error' }
	];

	// -----------------------------------------------------------------
	// Step navigation
	// -----------------------------------------------------------------
	var steps = Array.prototype.slice.call(root.querySelectorAll('.import-step'));
	var panes = Array.prototype.slice.call(root.querySelectorAll('.import-pane'));
	var btnPrev = root.querySelector('[data-import-prev]');
	var btnNext = root.querySelector('[data-import-next]');
	var current = 0;
	var furthest = 0;

	function showStep(index) {
		if (index < 0 || index >= panes.length) return;
		current = index;
		if (index > furthest) furthest = index;

		// a validation message from the previous step must not follow us
		if (notice) notice.classList.add('d-none');

		steps.forEach(function (step, i) {
			step.classList.toggle('is-active', i === current);
			step.classList.toggle('is-done', i < current);
			step.classList.toggle('is-locked', i > furthest);
			step.setAttribute('aria-current', i === current ? 'step' : 'false');
		});

		panes.forEach(function (pane, i) {
			pane.classList.toggle('is-active', i === current);
		});

		btnPrev.disabled = current === 0;
		// last pane is the result screen - swap the primary action
		if (current === panes.length - 1) {
			btnNext.classList.add('d-none');
			btnPrev.classList.add('d-none');
		} else {
			btnNext.classList.remove('d-none');
			btnPrev.classList.remove('d-none');
			btnNext.innerHTML = current === panes.length - 2
				? 'Start Import <i class="ti ti-player-play ms-1"></i>'
				: 'Continue <i class="ti ti-arrow-right ms-1"></i>';
		}

		root.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	steps.forEach(function (step, i) {
		step.addEventListener('click', function () {
			// only allow jumping back to a step already reached
			if (i <= furthest) showStep(i);
		});
	});

	btnPrev.addEventListener('click', function () {
		showStep(current - 1);
	});

	btnNext.addEventListener('click', function () {
		if (!validateStep(current)) return;
		if (current === panes.length - 2) {
			runImport();
		} else {
			showStep(current + 1);
		}
	});

	// Gate progression on the current step's own requirements.
	function validateStep(index) {
		if (index === 0) {
			if (!fileChosen) {
				showNotice('Choose a file to import before continuing.');
				return false;
			}
		}
		if (index === 1) {
			var missing = requiredMissing();
			if (missing.length) {
				showNotice('Map the required field(s): ' + missing.join(', '));
				return false;
			}
		}
		return true;
	}

	var notice = root.querySelector('[data-import-notice]');
	function showNotice(message) {
		if (!notice) return;
		notice.textContent = message;
		notice.classList.remove('d-none');
		window.setTimeout(function () {
			notice.classList.add('d-none');
		}, 4000);
	}

	// -----------------------------------------------------------------
	// Step 1 - file selection
	// -----------------------------------------------------------------
	var dropzone = root.querySelector('.import-dropzone');
	var fileInput = root.querySelector('#import_file');
	var filePreview = root.querySelector('[data-import-file]');
	var fileChosen = false;

	function humanSize(bytes) {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / 1048576).toFixed(1) + ' MB';
	}

	function acceptFile(file) {
		if (!file) return;
		fileChosen = true;
		filePreview.classList.remove('d-none');
		filePreview.querySelector('[data-import-file-name]').textContent = file.name;
		filePreview.querySelector('[data-import-file-meta]').textContent =
			humanSize(file.size) + ' • ' + (SAMPLE_COLUMNS.length) + ' columns detected • 128 rows';
		dropzone.classList.add('d-none');
	}

	if (fileInput) {
		fileInput.addEventListener('change', function () {
			acceptFile(this.files[0]);
		});
	}

	if (dropzone) {
		['dragenter', 'dragover'].forEach(function (evt) {
			dropzone.addEventListener(evt, function (e) {
				e.preventDefault();
				dropzone.classList.add('is-dragover');
			});
		});
		['dragleave', 'drop'].forEach(function (evt) {
			dropzone.addEventListener(evt, function (e) {
				e.preventDefault();
				dropzone.classList.remove('is-dragover');
			});
		});
		dropzone.addEventListener('drop', function (e) {
			if (e.dataTransfer && e.dataTransfer.files.length) {
				acceptFile(e.dataTransfer.files[0]);
			}
		});
	}

	var btnClearFile = root.querySelector('[data-import-file-clear]');
	if (btnClearFile) {
		btnClearFile.addEventListener('click', function () {
			fileChosen = false;
			if (fileInput) fileInput.value = '';
			filePreview.classList.add('d-none');
			dropzone.classList.remove('d-none');
		});
	}

	// -----------------------------------------------------------------
	// Step 2 - column mapping
	// -----------------------------------------------------------------
	var mapBody = root.querySelector('[data-import-map-body]');
	var mapSummary = root.querySelector('[data-import-map-summary]');

	function fieldOptions(selected) {
		var html = '<option value="">Do not import</option>';
		CRM_FIELDS.forEach(function (field) {
			html += '<option value="' + field.id + '"' +
				(field.id === selected ? ' selected' : '') + '>' +
				field.label + (field.required ? ' *' : '') + '</option>';
		});
		return html;
	}

	function buildMappingRows() {
		if (!mapBody) return;
		var html = '';
		SAMPLE_COLUMNS.forEach(function (col, i) {
			html += '<tr>' +
				'<td><span class="fw-medium text-dark">' + col.column + '</span></td>' +
				'<td><span class="import-sample">' + (col.sample || '—') + '</span></td>' +
				'<td><i class="ti ti-arrow-right text-muted"></i></td>' +
				'<td>' +
				'<select class="form-select form-select-sm" data-map-select="' + i + '" ' +
				'aria-label="CRM field for column ' + col.column + '">' +
				fieldOptions(col.suggested) +
				'</select>' +
				'</td>' +
				'</tr>';
		});
		mapBody.innerHTML = html;

		mapBody.querySelectorAll('[data-map-select]').forEach(function (select) {
			select.addEventListener('change', refreshMapSummary);
		});
		refreshMapSummary();
	}

	// Which required CRM fields have no column pointing at them yet.
	function requiredMissing() {
		if (!mapBody) return [];
		var mapped = [];
		mapBody.querySelectorAll('[data-map-select]').forEach(function (s) {
			if (s.value) mapped.push(s.value);
		});
		return CRM_FIELDS
			.filter(function (f) { return f.required && mapped.indexOf(f.id) === -1; })
			.map(function (f) { return f.label; });
	}

	function refreshMapSummary() {
		if (!mapBody || !mapSummary) return;
		var selects = Array.prototype.slice.call(mapBody.querySelectorAll('[data-map-select]'));
		var mappedCount = selects.filter(function (s) { return s.value; }).length;
		var missing = requiredMissing();

		// flag duplicate targets - two columns writing the same field
		var seen = {};
		var duplicates = [];
		selects.forEach(function (s) {
			if (!s.value) return;
			if (seen[s.value]) {
				if (duplicates.indexOf(s.value) === -1) duplicates.push(s.value);
			}
			seen[s.value] = true;
		});

		selects.forEach(function (s) {
			var row = s.closest('tr');
			if (row) row.classList.toggle('is-unmapped', !!(s.value && duplicates.indexOf(s.value) > -1));
		});

		var parts = [
			'<span class="text-dark fw-medium">' + mappedCount + '</span> of ' +
			selects.length + ' columns mapped'
		];
		if (missing.length) {
			parts.push('<span class="text-danger"><i class="ti ti-alert-circle"></i> Missing required: ' +
				missing.join(', ') + '</span>');
		} else {
			parts.push('<span class="text-success"><i class="ti ti-circle-check"></i> All required fields mapped</span>');
		}
		if (duplicates.length) {
			parts.push('<span class="text-warning"><i class="ti ti-alert-triangle"></i> ' +
				duplicates.length + ' field(s) mapped more than once</span>');
		}
		mapSummary.innerHTML = parts.join('<span class="mx-2 text-muted">|</span>');
	}

	var btnAutoMap = root.querySelector('[data-import-automap]');
	if (btnAutoMap) {
		btnAutoMap.addEventListener('click', function () {
			mapBody.querySelectorAll('[data-map-select]').forEach(function (select, i) {
				select.value = SAMPLE_COLUMNS[i].suggested || '';
			});
			refreshMapSummary();
		});
	}

	var btnClearMap = root.querySelector('[data-import-clearmap]');
	if (btnClearMap) {
		btnClearMap.addEventListener('click', function () {
			mapBody.querySelectorAll('[data-map-select]').forEach(function (select) {
				select.value = '';
			});
			refreshMapSummary();
		});
	}

	// -----------------------------------------------------------------
	// Step 3 - validation preview + duplicate strategy
	// -----------------------------------------------------------------
	var issuesBody = root.querySelector('[data-import-issues-body]');

	function buildIssues() {
		if (!issuesBody) return;
		var html = '';
		VALIDATION_ROWS.forEach(function (issue) {
			var badge = issue.level === 'error'
				? '<span class="badge bg-soft-danger text-danger">Error</span>'
				: '<span class="badge bg-soft-warning text-warning">Warning</span>';
			html += '<tr>' +
				'<td>' + issue.row + '</td>' +
				'<td><span class="fw-medium text-dark">' + issue.column + '</span></td>' +
				'<td><span class="import-sample">' + (issue.value || '(empty)') + '</span></td>' +
				'<td>' + issue.issue + '</td>' +
				'<td>' + badge + '</td>' +
				'</tr>';
		});
		issuesBody.innerHTML = html;
	}

	// keep the radio-card highlight in sync (fallback for no :has())
	root.querySelectorAll('.import-strategy input[type="radio"]').forEach(function (radio) {
		radio.addEventListener('change', function () {
			root.querySelectorAll('.import-strategy').forEach(function (card) {
				var input = card.querySelector('input[type="radio"]');
				card.classList.toggle('is-selected', !!(input && input.checked));
			});
		});
	});

	// -----------------------------------------------------------------
	// Step 4 - run the import
	// -----------------------------------------------------------------
	var progressWrap = root.querySelector('[data-import-progress]');
	var progressBar = root.querySelector('[data-import-progress-bar]');
	var progressText = root.querySelector('[data-import-progress-text]');
	var resultWrap = root.querySelector('[data-import-result]');

	function runImport() {
		showStep(panes.length - 1);
		if (!progressWrap) return;

		progressWrap.classList.remove('d-none');
		if (resultWrap) resultWrap.classList.add('d-none');

		var pct = 0;
		var total = 128;
		var timer = window.setInterval(function () {
			pct += Math.random() * 12 + 4;
			if (pct >= 100) {
				pct = 100;
				window.clearInterval(timer);
				window.setTimeout(function () {
					progressWrap.classList.add('d-none');
					if (resultWrap) resultWrap.classList.remove('d-none');
				}, 400);
			}
			progressBar.style.width = pct + '%';
			progressBar.setAttribute('aria-valuenow', Math.round(pct));
			progressText.textContent = 'Importing ' +
				Math.round(total * pct / 100) + ' of ' + total + ' rows...';
		}, 260);
	}

	var btnRestart = root.querySelector('[data-import-restart]');
	if (btnRestart) {
		btnRestart.addEventListener('click', function () {
			furthest = 0;
			fileChosen = false;
			if (fileInput) fileInput.value = '';
			if (filePreview) filePreview.classList.add('d-none');
			if (dropzone) dropzone.classList.remove('d-none');
			buildMappingRows();
			showStep(0);
		});
	}

	// -----------------------------------------------------------------
	buildMappingRows();
	buildIssues();
	showStep(0);

})();
