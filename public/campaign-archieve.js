/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
Description  : Reports module - Report Builder, Scheduled Reports, Sales
               Forecasting, Win/Loss Analysis and Sales Velocity.

One file for the whole module. Each section is a self-contained IIFE that
early-returns when its page marker is absent, so loading this on a page that
uses none of it costs nothing at runtime.

Static template: every figure below is mock CRM data. There is no report
engine, no scheduler and no export pipeline - swap the data blocks for your
own API layer when wiring this up.

Sections
--------
   1. Shared helpers
   2. Report Builder     (report-builder.html)
   3. Scheduled Reports  (scheduled-reports.html)
   4. Sales Forecasting  (sales-forecasting.html)
   5. Win/Loss Analysis  (win-loss-analysis.html)
   6. Sales Velocity     (sales-velocity.html)
*/


/* =======================================================================
   1. Shared helpers
   ======================================================================= */
window.CRMS_REPORT = (function () {
	"use strict";

	var GRID = { borderColor: '#e5e7eb', strokeDashArray: 4,  padding : {left: 0, right: 0} };

	var COLOR = {
		primary: '#3B44F6',
		success: '#22C55E',
		warning: '#FFA800',
		danger: '#FF6B6B',
		info: '#0DCAF0',
		purple: '#7B61FF',
		grey: '#ADB5BD'
	};

	function money(n) {
		return '$' + Number(n).toLocaleString('en-US');
	}

	function moneyShort(n) {
		if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
		if (Math.abs(n) >= 1000) return '$' + Math.round(n / 1000) + 'K';
		return '$' + n;
	}

	function esc(str) {
		return String(str).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}

	// Render an ApexChart into `sel`, disposing anything already there so
	// repeated filter changes do not stack canvases.
	var live = {};
	function chart(sel, options) {
		if (typeof ApexCharts === 'undefined') return null;
		var el = document.querySelector(sel);
		if (!el) return null;
		if (live[sel]) {
			try { live[sel].destroy(); } catch (e) { /* already gone */ }
		}
		var c = new ApexCharts(el, options);
		c.render();
		live[sel] = c;
		return c;
	}

	// Toast used by every page in the module for static confirmations.
	function notify(root, message, tone) {
		var box = root.querySelector('[data-report-toast]');
		if (!box) return;
		box.className = 'alert alert-' + (tone || 'success') + ' py-2 px-3 fs-13 mb-3';
		box.textContent = message;
		box.classList.remove('d-none');
		window.clearTimeout(box._t);
		box._t = window.setTimeout(function () { box.classList.add('d-none'); }, 2800);
	}

	// Paint every [data-bar] width in a container.
	function bars(root) {
		root.querySelectorAll('[data-bar]').forEach(function (el) {
			el.style.width = Math.min(parseFloat(el.getAttribute('data-bar')) || 0, 100) + '%';
		});
	}

	// Wire a group of toggle buttons; calls back with the chosen value.
	// Scoped to the document: these switchers often sit in the page header,
	// which is outside the page's own root element.
	function toggleGroup(root, attr, onPick) {
		document.querySelectorAll('[' + attr + ']').forEach(function (btn) {
			btn.addEventListener('click', function () {
				document.querySelectorAll('[' + attr + ']').forEach(function (b) {
					b.classList.remove('active');
				});
				btn.classList.add('active');
				onPick(btn.getAttribute(attr), btn);
			});
		});
	}

	function delta(v, suffix) {
		var cls = v > 0 ? 'is-up' : (v < 0 ? 'is-down' : 'is-flat');
		var icon = v > 0 ? 'ti-arrow-up-right' : (v < 0 ? 'ti-arrow-down-right' : 'ti-minus');
		return '<span class="rep-delta ' + cls + '"><i class="ti ' + icon + '"></i>' +
			(v > 0 ? '+' : '') + v + (suffix || '%') + '</span>';
	}

	return {
		GRID: GRID, COLOR: COLOR, money: money, moneyShort: moneyShort,
		esc: esc, chart: chart, notify: notify, bars: bars,
		toggleGroup: toggleGroup, delta: delta
	};
})();


/* =======================================================================
   2. Report Builder  (report-builder.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-report-builder]');
	if (!root) return;
	var R = window.CRMS_REPORT;

	// ---- CRM objects and their reportable fields -----------------------
	var T = { text: 'Aa', num: '#', date: '📅', pick: '▾' };

	function f(name, type) { return { name: name, type: type }; }

	var OBJECTS = {
		leads: {
			label: 'Leads', icon: 'ti-target-arrow',
			fields: [f('Lead Name', 'text'), f('Company', 'text'), f('Email', 'text'),
			f('Phone', 'text'), f('Lead Source', 'pick'), f('Lead Status', 'pick'),
			f('Lead Score', 'num'), f('Owner', 'pick'), f('Industry', 'pick'),
			f('Region', 'pick'), f('Est. Value', 'num'), f('Created Date', 'date')],
			link: 'leads.html', linkLabel: 'View Lead'
		},
		contacts: {
			label: 'Contacts', icon: 'ti-users',
			fields: [f('Contact Name', 'text'), f('Job Title', 'text'), f('Company', 'text'),
			f('Email', 'text'), f('Phone', 'text'), f('Owner', 'pick'),
			f('Last Interaction', 'date'), f('Created Date', 'date')],
			link: 'contacts.html', linkLabel: 'View Contact'
		},
		companies: {
			label: 'Companies', icon: 'ti-building',
			fields: [f('Company Name', 'text'), f('Industry', 'pick'), f('Company Size', 'num'),
			f('Region', 'pick'), f('Account Owner', 'pick'), f('Total Revenue', 'num'),
			f('Health Score', 'num'), f('Customer Since', 'date')],
			link: 'companies.html', linkLabel: 'View Customer'
		},
		deals: {
			label: 'Deals', icon: 'ti-briefcase',
			fields: [f('Deal Name', 'text'), f('Company', 'text'), f('Stage', 'pick'),
			f('Amount', 'num'), f('Probability', 'num'), f('Owner', 'pick'),
			f('Source', 'pick'), f('Team', 'pick'), f('Region', 'pick'),
			f('Expected Close', 'date'), f('Created Date', 'date')],
			link: 'deals-details.html', linkLabel: 'View Deal'
		},
		activities: {
			label: 'Activities', icon: 'ti-bolt',
			fields: [f('Subject', 'text'), f('Activity Type', 'pick'), f('Related To', 'text'),
			f('Owner', 'pick'), f('Status', 'pick'), f('Due Date', 'date')],
			link: 'activities.html', linkLabel: 'View Activity'
		},
		opportunities: {
			label: 'Opportunities', icon: 'ti-chart-arrows-vertical',
			fields: [f('Opportunity', 'text'), f('Account', 'text'), f('Stage', 'pick'),
			f('Amount', 'num'), f('Probability', 'num'), f('Owner', 'pick'),
			f('Close Date', 'date')],
			link: 'opportunities-list.html', linkLabel: 'View Opportunity'
		},
		quotations: {
			label: 'Quotations', icon: 'ti-file-invoice',
			fields: [f('Quotation No', 'text'), f('Customer', 'text'), f('Amount', 'num'),
			f('Status', 'pick'), f('Valid Until', 'date'), f('Owner', 'pick')],
			link: 'quotations-list.html', linkLabel: 'View Quotation'
		},
		orders: {
			label: 'Sales Orders', icon: 'ti-shopping-cart',
			fields: [f('Order No', 'text'), f('Customer', 'text'), f('Amount', 'num'),
			f('Status', 'pick'), f('Order Date', 'date'), f('Owner', 'pick')],
			link: 'sales-order-list.html', linkLabel: 'View Order'
		},
		proposals: {
			label: 'Proposals', icon: 'ti-file-text',
			fields: [f('Proposal No', 'text'), f('Customer', 'text'), f('Amount', 'num'),
			f('Status', 'pick'), f('Sent Date', 'date'), f('Owner', 'pick')],
			link: 'proposals.html', linkLabel: 'View Proposal'
		},
		contracts: {
			label: 'Contracts', icon: 'ti-file-certificate',
			fields: [f('Contract No', 'text'), f('Customer', 'text'), f('Value', 'num'),
			f('Status', 'pick'), f('Start Date', 'date'), f('Renewal Date', 'date')],
			link: 'contracts.html', linkLabel: 'View Contract'
		},
		estimations: {
			label: 'Estimations', icon: 'ti-calculator',
			fields: [f('Estimation No', 'text'), f('Customer', 'text'), f('Amount', 'num'),
			f('Status', 'pick'), f('Created Date', 'date')],
			link: 'estimations.html', linkLabel: 'View Estimation'
		},
		invoices: {
			label: 'Invoices', icon: 'ti-receipt',
			fields: [f('Invoice No', 'text'), f('Customer', 'text'), f('Amount', 'num'),
			f('Status', 'pick'), f('Issued Date', 'date'), f('Due Date', 'date')],
			link: 'invoice-details.html', linkLabel: 'View Invoice'
		},
		payments: {
			label: 'Payments', icon: 'ti-credit-card',
			fields: [f('Payment No', 'text'), f('Customer', 'text'), f('Amount', 'num'),
			f('Method', 'pick'), f('Status', 'pick'), f('Paid Date', 'date')],
			link: 'payments.html', linkLabel: 'View Payment'
		},
		projects: {
			label: 'Projects', icon: 'ti-briefcase-2',
			fields: [f('Project Name', 'text'), f('Customer', 'text'), f('Status', 'pick'),
			f('Progress', 'num'), f('Lead', 'pick'), f('Due Date', 'date')],
			link: 'project-details.html', linkLabel: 'View Project'
		},
		tasks: {
			label: 'Tasks', icon: 'ti-checklist',
			fields: [f('Task Name', 'text'), f('Related To', 'text'), f('Priority', 'pick'),
			f('Status', 'pick'), f('Assignee', 'pick'), f('Due Date', 'date')],
			link: 'tasks.html', linkLabel: 'View Task'
		},
		users: {
			label: 'Users / Teams', icon: 'ti-user-cog',
			fields: [f('User Name', 'text'), f('Team', 'pick'), f('Role', 'pick'),
			f('Deals Won', 'num'), f('Revenue', 'num'), f('Quota Attainment', 'num')],
			link: 'manage-users.html', linkLabel: 'View User'
		}
	};

	// Sample preview rows, keyed by object. Only used to make the preview
	// look like real CRM output.
	var SAMPLE = {
		deals: [
			['Halcyon Partners - Pilot', 'Halcyon Partners', 'Negotiation', 128000, 74, 'Tomas Lindqvist', 'Outbound', 'Enterprise', 'North America', '19 Sep 2026'],
			['Northwind Logistics - Renewal', 'Northwind Logistics', 'Contract Review', 96000, 92, 'Adrian Herrera', 'Referral', 'Enterprise', 'North America', '28 Aug 2026'],
			['Meridian Health - Expansion', 'Meridian Health', 'Negotiation', 74500, 61, 'Ellis Vandermeer', 'Referral', 'Mid-Market', 'North America', '04 Sep 2026'],
			['Arclight Media - Upsell', 'Arclight Media', 'Proposal Sent', 62000, 58, 'Nadia Okonkwo', 'Webinar', 'Mid-Market', 'EMEA', '26 Sep 2026'],
			['Cobalt Studio - New Business', 'Cobalt Studio', 'Proposal Sent', 48000, 34, 'Priya Raghunathan', 'Trade Show', 'SMB', 'EMEA', '12 Sep 2026'],
			['Ridgeway Manufacturing', 'Ridgeway Manufacturing', 'Needs Analysis', 38500, 30, 'Nadia Okonkwo', 'Paid Search', 'SMB', 'EMEA', '25 Sep 2026']
		],
		leads: [
			['Marcus Whitfield', 'Northwind Logistics', 'm.whitfield@northwind.io', '+1 415 555 0134', 'Webinar', 'Qualified', 92, 'Adrian Herrera', 'Logistics', 'North America', 96000, '04 Aug 2026'],
			['Ellis Vandermeer', 'Halcyon Partners', 'e.vandermeer@halcyon.partners', '+1 312 555 0119', 'Outbound', 'Qualified', 88, 'Tomas Lindqvist', 'Financial Services', 'North America', 128000, '01 Aug 2026'],
			['Priya Raghunathan', 'Meridian Health', 'p.raghunathan@meridianhealth.com', '+1 617 555 0188', 'Referral', 'Working', 84, 'Ellis Vandermeer', 'Healthcare', 'North America', 74500, '07 Aug 2026'],
			['Tomas Lindqvist', 'Cobalt Studio', 't.lindqvist@cobaltstudio.se', '+46 8 555 0142', 'Trade Show', 'Working', 71, 'Adrian Herrera', 'Media', 'EMEA', 48000, '11 Aug 2026'],
			['Nadia Okonkwo', 'Ridgeway Manufacturing', 'n.okonkwo@ridgeway.co.uk', '+44 20 5550 173', 'Paid Search', 'New', 58, 'Priya Raghunathan', 'Manufacturing', 'EMEA', 38500, '13 Aug 2026']
		]
	};

	// Generic fallback so every object previews something sensible.
	function sampleFor(key, fields) {
		if (SAMPLE[key]) return SAMPLE[key];
		var base = [
			['Halcyon Partners', 'Northwind Logistics', 'Meridian Health',
				'Arclight Media', 'Cobalt Studio'],
			['Active', 'Pending', 'Approved', 'Draft', 'Completed'],
			[128000, 96000, 74500, 62000, 48000],
			['Tomas Lindqvist', 'Adrian Herrera', 'Ellis Vandermeer', 'Nadia Okonkwo', 'Priya Raghunathan'],
			['19 Sep 2026', '28 Aug 2026', '04 Sep 2026', '26 Sep 2026', '12 Sep 2026']
		];
		var rows = [];
		for (var r = 0; r < 5; r++) {
			rows.push(fields.map(function (fld, i) {
				if (fld.type === 'num') return base[2][(r + i) % 5];
				if (fld.type === 'date') return base[4][(r + i) % 5];
				if (fld.type === 'pick') return base[1][(r + i) % 5];
				if (i === 0) return OBJECTS[key].label.replace(/s$/, '') + ' ' + (1041 + r * 7);
				return base[0][(r + i) % 5];
			}));
		}
		return rows;
	}

	// ---- state ---------------------------------------------------------
	var state = {
		object: 'deals',
		fields: ['Deal Name', 'Company', 'Stage', 'Amount', 'Probability', 'Owner'],
		groupBy: '',
		sortBy: 'Amount',
		sortDir: 'desc',
		aggregation: 'sum',
		range: 'quarter',
		viz: 'table',
		groups: [
			{ join: 'and', rows: [{ field: 'Stage', op: 'is not', value: 'Closed Lost' }] }
		]
	};

	// ---- step navigation (reuses the wizard stepper) --------------------
	var steps = Array.prototype.slice.call(root.querySelectorAll('.import-step'));
	var panes = Array.prototype.slice.call(root.querySelectorAll('.import-pane'));
	var current = 0;

	function showStep(i) {
		if (i < 0 || i >= panes.length) return;
		current = i;
		steps.forEach(function (s, n) {
			s.classList.toggle('is-active', n === current);
			s.classList.toggle('is-done', n < current);
			s.setAttribute('aria-current', n === current ? 'step' : 'false');
		});
		panes.forEach(function (p, n) {
			p.classList.toggle('is-active', n === current);
		});
		var prev = root.querySelector('[data-rb-prev]');
		var next = root.querySelector('[data-rb-next]');
		if (prev) prev.disabled = current === 0;
		if (next) {
			next.innerHTML = current === panes.length - 1
				? 'Save Report <i class="ti ti-device-floppy ms-1"></i>'
				: 'Continue <i class="ti ti-arrow-right ms-1"></i>';
		}
		if (current === panes.length - 1) renderPreview();
	}

	steps.forEach(function (s, i) {
		s.addEventListener('click', function () { showStep(i); });
	});
	var btnPrev = root.querySelector('[data-rb-prev]');
	if (btnPrev) btnPrev.addEventListener('click', function () { showStep(current - 1); });
	var btnNext = root.querySelector('[data-rb-next]');
	if (btnNext) {
		btnNext.addEventListener('click', function () {
			if (current === panes.length - 1) {
				R.notify(root, 'Report saved to My Reports.');
			} else {
				showStep(current + 1);
			}
		});
	}

	// ---- step 1: object picker -----------------------------------------
	var objWrap = root.querySelector('[data-rb-objects]');
	if (objWrap) {
		objWrap.innerHTML = Object.keys(OBJECTS).map(function (k) {
			var o = OBJECTS[k];
			return '<div class="col-lg-3 col-md-4 col-6 d-flex">' +
				'<button type="button" class="rb-viz' + (k === state.object ? ' is-selected' : '') +
				'" data-rb-object="' + k + '">' +
				'<i class="ti ' + o.icon + '"></i><span>' + o.label + '</span></button></div>';
		}).join('');

		objWrap.querySelectorAll('[data-rb-object]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				objWrap.querySelectorAll('[data-rb-object]').forEach(function (b) {
					b.classList.remove('is-selected');
				});
				btn.classList.add('is-selected');
				state.object = btn.getAttribute('data-rb-object');
				// fields, group/sort and filters are object-specific
				state.fields = OBJECTS[state.object].fields.slice(0, 6).map(function (x) { return x.name; });
				state.groupBy = '';
				state.sortBy = state.fields[0];
				state.groups = [{ join: 'and', rows: [] }];
				renderFields();
				renderGroupSort();
				renderFilters();
				var lbl = root.querySelector('[data-rb-object-label]');
				if (lbl) lbl.textContent = OBJECTS[state.object].label;
			});
		});
	}

	// ---- step 2: fields -------------------------------------------------
	var fieldWrap = root.querySelector('[data-rb-fields]');
	var selWrap = root.querySelector('[data-rb-selected]');

	function renderFields() {
		if (!fieldWrap) return;
		fieldWrap.innerHTML = OBJECTS[state.object].fields.map(function (fl) {
			var on = state.fields.indexOf(fl.name) > -1;
			return '<button type="button" class="rb-field' + (on ? ' is-selected' : '') +
				'" data-rb-field="' + R.esc(fl.name) + '">' +
				'<span class="rb-field-type">' + T[fl.type] + '</span>' +
				'<span class="rb-field-name">' + R.esc(fl.name) + '</span>' +
				'<i class="ti ' + (on ? 'ti-check text-primary' : 'ti-plus text-muted') + '"></i>' +
				'</button>';
		}).join('');

		fieldWrap.querySelectorAll('[data-rb-field]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var name = btn.getAttribute('data-rb-field');
				var at = state.fields.indexOf(name);
				if (at > -1) state.fields.splice(at, 1);
				else state.fields.push(name);
				renderFields();
				renderGroupSort();
			});
		});
		renderSelected();
	}

	function renderSelected() {
		if (!selWrap) return;
		if (!state.fields.length) {
			selWrap.innerHTML = '<span class="fs-12 text-muted">No columns selected yet - ' +
				'pick fields on the left.</span>';
			return;
		}
		selWrap.innerHTML = state.fields.map(function (n) {
			return '<span class="rb-chip">' + R.esc(n) +
				'<button type="button" data-rb-unpick="' + R.esc(n) + '" ' +
				'aria-label="Remove ' + R.esc(n) + '"><i class="ti ti-x"></i></button></span>';
		}).join('');
		selWrap.querySelectorAll('[data-rb-unpick]').forEach(function (b) {
			b.addEventListener('click', function () {
				var at = state.fields.indexOf(b.getAttribute('data-rb-unpick'));
				if (at > -1) state.fields.splice(at, 1);
				renderFields();
				renderGroupSort();
			});
		});
	}

	var btnAll = root.querySelector('[data-rb-fields-all]');
	if (btnAll) {
		btnAll.addEventListener('click', function () {
			state.fields = OBJECTS[state.object].fields.map(function (x) { return x.name; });
			renderFields();
			renderGroupSort();
		});
	}
	var btnNone = root.querySelector('[data-rb-fields-none]');
	if (btnNone) {
		btnNone.addEventListener('click', function () {
			state.fields = [];
			renderFields();
			renderGroupSort();
		});
	}

	// ---- step 3: filters ------------------------------------------------
	var filterWrap = root.querySelector('[data-rb-filters]');

	var OPS = ['is', 'is not', 'contains', 'greater than', 'less than', 'between', 'is empty'];

	var VALUES = {
		'Stage': ['Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review', 'Closed Won', 'Closed Lost'],
		'Owner': ['Adrian Herrera', 'Ellis Vandermeer', 'Priya Raghunathan', 'Tomas Lindqvist', 'Nadia Okonkwo'],
		'Account Owner': ['Adrian Herrera', 'Ellis Vandermeer', 'Priya Raghunathan', 'Tomas Lindqvist', 'Nadia Okonkwo'],
		'Assignee': ['Adrian Herrera', 'Ellis Vandermeer', 'Priya Raghunathan', 'Tomas Lindqvist', 'Nadia Okonkwo'],
		'Lead Source': ['Referral', 'Webinar', 'Outbound', 'Trade Show', 'Paid Search', 'Content Download'],
		'Source': ['Referral', 'Webinar', 'Outbound', 'Trade Show', 'Paid Search'],
		'Lead Status': ['New', 'Working', 'Qualified', 'Unqualified'],
		'Status': ['Draft', 'Pending', 'Active', 'Approved', 'Completed', 'Overdue'],
		'Industry': ['Financial Services', 'Healthcare', 'Logistics', 'Manufacturing', 'Media', 'Technology'],
		'Region': ['North America', 'EMEA', 'APAC', 'LATAM'],
		'Team': ['Enterprise', 'Mid-Market', 'SMB'],
		'Priority': ['High', 'Medium', 'Low'],
		'Method': ['Bank Transfer', 'Credit Card', 'Cheque']
	};

	function filterableFields() {
		return OBJECTS[state.object].fields;
	}

	function valueControl(row) {
		var opts = VALUES[row.field];
		if (opts) {
			return '<select class="form-select form-select-sm" data-rb-val>' +
				opts.map(function (o) {
					return '<option' + (o === row.value ? ' selected' : '') + '>' + o + '</option>';
				}).join('') + '</select>';
		}
		return '<input type="text" class="form-control" data-rb-val ' +
			'value="' + R.esc(row.value || '') + '" placeholder="Value">';
	}

	function renderFilters() {
		if (!filterWrap) return;

		if (!state.groups.length || (state.groups.length === 1 && !state.groups[0].rows.length)) {
			filterWrap.innerHTML = '<div class="ai-empty py-4">' +
				'<span class="ai-empty-icon"><i class="ti ti-filter"></i></span>' +
				'<h6>No filters yet</h6>' +
				'<p>The report will include every ' + OBJECTS[state.object].label.toLowerCase() +
				' record. Add a filter to narrow it down.</p></div>';
			updateFilterCount();
			return;
		}

		filterWrap.innerHTML = state.groups.map(function (g, gi) {
			var rows = g.rows.map(function (row, ri) {
				return '<div class="rb-filter">' +
					(ri === 0
						? '<span class="rb-filter-join fs-12 text-muted">Where</span>'
						: '<select class="form-select form-select-sm rb-filter-join" data-rb-join="' + gi + '">' +
						'<option value="and"' + (g.join === 'and' ? ' selected' : '') + '>AND</option>' +
						'<option value="or"' + (g.join === 'or' ? ' selected' : '') + '>OR</option></select>') +
					'<select class="form-select form-select-sm" data-rb-field-sel="' + gi + ':' + ri + '">' +
					filterableFields().map(function (fl) {
						return '<option' + (fl.name === row.field ? ' selected' : '') + '>' + fl.name + '</option>';
					}).join('') + '</select>' +
					'<select class="form-select form-select-sm" data-rb-op="' + gi + ':' + ri + '">' +
					OPS.map(function (o) {
						return '<option' + (o === row.op ? ' selected' : '') + '>' + o + '</option>';
					}).join('') + '</select>' +
					valueControl(row) +
					'<button type="button" class="btn btn-icon btn-outline-light shadow" ' +
					'data-rb-del="' + gi + ':' + ri + '" aria-label="Remove filter">' +
					'<i class="ti ti-trash"></i></button>' +
					'</div>';
			}).join('');

			return '<div class="rb-filter-group" data-join="' + (gi > 0 ? 'AND' : '') + '">' +
				'<div class="d-flex align-items-center justify-content-between mb-2">' +
				'<span class="fs-12 fw-medium text-dark">Filter group ' + (gi + 1) + '</span>' +
				(state.groups.length > 1
					? '<button type="button" class="btn btn-sm btn-outline-light shadow" ' +
					'data-rb-delgroup="' + gi + '"><i class="ti ti-x me-1"></i>Remove group</button>'
					: '') +
				'</div>' + rows +
				'<button type="button" class="btn btn-sm btn-outline-light shadow mt-2" ' +
				'data-rb-addrow="' + gi + '"><i class="ti ti-plus me-1"></i>Add condition</button>' +
				'</div>';
		}).join('');

		bindFilterEvents();
		updateFilterCount();
	}

	function bindFilterEvents() {
		filterWrap.querySelectorAll('[data-rb-field-sel]').forEach(function (sel) {
			sel.addEventListener('change', function () {
				var p = sel.getAttribute('data-rb-field-sel').split(':');
				var row = state.groups[p[0]].rows[p[1]];
				row.field = sel.value;
				row.value = (VALUES[row.field] || [''])[0];
				renderFilters();
			});
		});
		filterWrap.querySelectorAll('[data-rb-op]').forEach(function (sel) {
			sel.addEventListener('change', function () {
				var p = sel.getAttribute('data-rb-op').split(':');
				state.groups[p[0]].rows[p[1]].op = sel.value;
			});
		});
		filterWrap.querySelectorAll('[data-rb-join]').forEach(function (sel) {
			sel.addEventListener('change', function () {
				state.groups[sel.getAttribute('data-rb-join')].join = sel.value;
			});
		});
		filterWrap.querySelectorAll('[data-rb-val]').forEach(function (el) {
			el.addEventListener('change', function () {
				var wrap = el.closest('.rb-filter');
				var ref = wrap.querySelector('[data-rb-field-sel]').getAttribute('data-rb-field-sel').split(':');
				state.groups[ref[0]].rows[ref[1]].value = el.value;
			});
		});
		filterWrap.querySelectorAll('[data-rb-del]').forEach(function (b) {
			b.addEventListener('click', function () {
				var p = b.getAttribute('data-rb-del').split(':');
				state.groups[p[0]].rows.splice(p[1], 1);
				if (!state.groups[p[0]].rows.length && state.groups.length > 1) {
					state.groups.splice(p[0], 1);
				}
				renderFilters();
			});
		});
		filterWrap.querySelectorAll('[data-rb-addrow]').forEach(function (b) {
			b.addEventListener('click', function () {
				addRow(parseInt(b.getAttribute('data-rb-addrow'), 10));
			});
		});
		filterWrap.querySelectorAll('[data-rb-delgroup]').forEach(function (b) {
			b.addEventListener('click', function () {
				state.groups.splice(parseInt(b.getAttribute('data-rb-delgroup'), 10), 1);
				renderFilters();
			});
		});
	}

	function addRow(gi) {
		var first = filterableFields()[0];
		state.groups[gi].rows.push({
			field: first.name, op: 'is', value: (VALUES[first.name] || [''])[0]
		});
		renderFilters();
	}

	function updateFilterCount() {
		var n = state.groups.reduce(function (a, g) { return a + g.rows.length; }, 0);
		var el = root.querySelector('[data-rb-filter-count]');
		if (el) el.textContent = n + (n === 1 ? ' filter' : ' filters');
	}

	var addFilterBtn = root.querySelector('[data-rb-addfilter]');
	if (addFilterBtn) {
		addFilterBtn.addEventListener('click', function () {
			if (!state.groups.length) state.groups.push({ join: 'and', rows: [] });
			addRow(state.groups.length - 1);
		});
	}
	var addGroupBtn = root.querySelector('[data-rb-addgroup]');
	if (addGroupBtn) {
		addGroupBtn.addEventListener('click', function () {
			state.groups.push({ join: 'and', rows: [] });
			addRow(state.groups.length - 1);
		});
	}
	var clearBtn = root.querySelector('[data-rb-clearfilters]');
	if (clearBtn) {
		clearBtn.addEventListener('click', function () {
			state.groups = [{ join: 'and', rows: [] }];
			renderFilters();
			R.notify(root, 'All filters cleared.', 'warning');
		});
	}
	var applyBtn = root.querySelector('[data-rb-applyfilters]');
	if (applyBtn) {
		applyBtn.addEventListener('click', function () {
			renderPreview();
			R.notify(root, 'Filters applied to the preview.');
		});
	}

	// ---- step 4: group / sort / aggregate -------------------------------
	function renderGroupSort() {
		var g = root.querySelector('[data-rb-groupby]');
		var s = root.querySelector('[data-rb-sortby]');
		var opts = state.fields.length
			? state.fields
			: OBJECTS[state.object].fields.map(function (x) { return x.name; });

		if (g) {
			g.innerHTML = '<option value="">No grouping</option>' + opts.map(function (n) {
				return '<option' + (n === state.groupBy ? ' selected' : '') + '>' + n + '</option>';
			}).join('');
		}
		if (s) {
			s.innerHTML = opts.map(function (n) {
				return '<option' + (n === state.sortBy ? ' selected' : '') + '>' + n + '</option>';
			}).join('');
		}
	}

	root.querySelectorAll('[data-rb-set]').forEach(function (el) {
		el.addEventListener('change', function () {
			state[el.getAttribute('data-rb-set')] = el.value;
		});
	});

	// ---- step 5: visualization -----------------------------------------
	root.querySelectorAll('[data-rb-viz]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			root.querySelectorAll('[data-rb-viz]').forEach(function (b) {
				b.classList.remove('is-selected');
			});
			btn.classList.add('is-selected');
			state.viz = btn.getAttribute('data-rb-viz');
		});
	});

	// ---- step 6: preview -------------------------------------------------
	var previewWrap = root.querySelector('[data-rb-preview]');
	var loadingWrap = root.querySelector('[data-rb-loading]');

	function summaryLine() {
		var o = OBJECTS[state.object];
		var n = state.groups.reduce(function (a, g) { return a + g.rows.length; }, 0);
		return o.label + ' &middot; ' + state.fields.length + ' columns &middot; ' +
			n + ' filter' + (n === 1 ? '' : 's') +
			(state.groupBy ? ' &middot; grouped by ' + R.esc(state.groupBy) : '') +
			' &middot; sorted by ' + R.esc(state.sortBy) + ' ' + state.sortDir;
	}

	function tableHtml() {
		var o = OBJECTS[state.object];
		var all = o.fields.map(function (x) { return x.name; });
		var cols = state.fields.length ? state.fields : all.slice(0, 6);
		var idx = cols.map(function (c) { return all.indexOf(c); });
		var rows = sampleFor(state.object, o.fields);

		return '<div class="table-responsive"><table class="table table-nowrap mb-0">' +
			'<thead class="table-light"><tr>' +
			cols.map(function (c) { return '<th scope="col">' + R.esc(c) + '</th>'; }).join('') +
			'<th scope="col" class="no-sort"><span class="visually-hidden">Actions</span></th>' +
			'</tr></thead><tbody>' +
			rows.map(function (r) {
				return '<tr>' + idx.map(function (i, n) {
					var v = i > -1 ? r[i] : '—';
					if (typeof v === 'number' && String(cols[n]).match(/Amount|Value|Revenue/)) {
						v = R.money(v);
					}
					return '<td>' + (n === 0
						? '<a href="' + o.link + '" class="fw-medium text-dark">' + R.esc(v) + '</a>'
						: R.esc(v)) + '</td>';
				}).join('') +
					'<td><a href="' + o.link + '" class="btn btn-sm btn-outline-light shadow">' +
					o.linkLabel + '</a></td></tr>';
			}).join('') +
			'</tbody></table></div>';
	}

	function kpiHtml() {
		return '<div class="row g-3">' +
			[['Total Records', '53'], ['Total Amount', '$1.84M'],
			['Average Amount', '$34,717'], ['Weighted Amount', '$845K']]
				.map(function (k) {
					return '<div class="col-6 col-lg-3"><div class="border rounded p-3 h-100">' +
						'<div class="fs-12 text-muted mb-1">' + k[0] + '</div>' +
						'<div class="fs-22 fw-bold text-dark">' + k[1] + '</div></div></div>';
				}).join('') + '</div>';
	}

	var CHART_CATS = ['Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review'];
	var CHART_VALS = [620, 392, 486, 264, 235];

	function chartOptions(kind) {
		var base = {
			chart: { height: 340, toolbar: { show: false }, fontFamily: 'inherit' },
			colors: [R.COLOR.primary, R.COLOR.success, R.COLOR.warning, R.COLOR.info, R.COLOR.purple],
			grid: R.GRID,
			dataLabels: { enabled: false },
			xaxis: { categories: CHART_CATS, labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { formatter: function (v) { return '$' + v + 'K'; }, style: { fontSize: '12px' } } },
			series: [{ name: 'Amount', data: CHART_VALS }],
			tooltip: { y: { formatter: function (v) { return '$' + v + 'K'; } } }
		};

		if (kind === 'bar') {
			base.chart.type = 'bar';
			base.plotOptions = { bar: { columnWidth: '45%', borderRadius: 3, borderRadiusApplication: 'end' } };
		} else if (kind === 'line') {
			base.chart.type = 'line';
			base.stroke = { curve: 'smooth', width: 3 };
		} else if (kind === 'area') {
			base.chart.type = 'area';
			base.stroke = { curve: 'smooth', width: 2 };
			base.fill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } };
		} else if (kind === 'stacked') {
			base.chart.type = 'bar';
			base.chart.stacked = true;
			base.series = [
				{ name: 'Won', data: [180, 150, 210, 160, 190] },
				{ name: 'Open', data: [280, 160, 190, 74, 45] },
				{ name: 'Lost', data: [160, 82, 86, 30, 0] }
			];
			base.colors = [R.COLOR.success, R.COLOR.primary, R.COLOR.danger];
			base.plotOptions = { bar: { columnWidth: '48%', borderRadius: 3, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } };
			base.legend = { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' };
		} else if (kind === 'pie' || kind === 'donut') {
			base.chart.type = 'donut';
			base.series = CHART_VALS;
			base.labels = CHART_CATS;
			base.stroke = { width: 0 };
			base.legend = { position: 'bottom', fontSize: '12px', markers: { radius: 3 } };
			base.plotOptions = { pie: { donut: { size: '68%' } } };
			delete base.xaxis;
			delete base.yaxis;
		} else if (kind === 'funnel') {
			base.chart.type = 'bar';
			base.plotOptions = { bar: { horizontal: true, borderRadius: 3, barHeight: '58%', distributed: true } };
			base.legend = { show: false };
			base.dataLabels = { enabled: true, formatter: function (v) { return '$' + v + 'K'; } };
			base.yaxis = { labels: { style: { fontSize: '12px' } } };
			base.xaxis = { categories: CHART_CATS, labels: { style: { fontSize: '12px' } } };
		}
		return base;
	}

	function renderPreview() {
		if (!previewWrap) return;

		var meta = root.querySelector('[data-rb-summary]');
		if (meta) meta.innerHTML = summaryLine();

		// no columns selected is a real empty state, not an error
		if (!state.fields.length && state.viz === 'table') {
			previewWrap.innerHTML = '<div class="ai-empty">' +
				'<span class="ai-empty-icon"><i class="ti ti-table-off"></i></span>' +
				'<h6>No columns selected</h6>' +
				'<p>Go back to Select Fields and choose at least one column to preview.</p></div>';
			return;
		}

		if (loadingWrap) {
			loadingWrap.classList.remove('d-none');
			previewWrap.classList.add('d-none');
		}

		window.setTimeout(function () {
			if (loadingWrap) {
				loadingWrap.classList.add('d-none');
				previewWrap.classList.remove('d-none');
			}
			if (state.viz === 'table') {
				previewWrap.innerHTML = tableHtml();
			} else if (state.viz === 'kpi') {
				previewWrap.innerHTML = kpiHtml();
			} else {
				previewWrap.innerHTML = '<div id="rb_chart"></div>';
				R.chart('#rb_chart', chartOptions(state.viz));
			}
		}, 500);
	}

	// ---- report actions --------------------------------------------------
	var ACTIONS = {
		save: 'Report saved to My Reports.',
		saveas: 'Saved as a copy - "Pipeline by Stage (copy)".',
		export: 'Export queued - the file will download when ready.',
		print: 'Sending the report to your printer...',
		schedule: 'Schedule created - opening Scheduled Reports.',
		share: 'Share link copied to your clipboard.',
		edit: 'Report configuration unlocked for editing.',
		'delete': 'Report moved to the recycle bin.',
		dashboard: 'Report pinned to the Sales Dashboard.'
	};

	// export / print / share / save sit in the page header, outside `root`
	document.querySelectorAll('[data-rb-action]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var k = btn.getAttribute('data-rb-action');
			R.notify(root, ACTIONS[k] || 'Done.', k === 'delete' ? 'danger' : 'success');
		});
	});

	// ---- go ---------------------------------------------------------------
	renderFields();
	renderGroupSort();
	renderFilters();
	showStep(0);

})();


/* =======================================================================
   3. Scheduled Reports  (scheduled-reports.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-scheduled-reports]');
	if (!root) return;
	var R = window.CRMS_REPORT;

	var SCHEDULES = [
		{
			id: 'S-101', name: 'Weekly Pipeline Review', type: 'Deals', freq: 'Weekly',
			detail: 'Every Monday, 08:00', recipients: ['Sales Leadership', '+4'], format: 'PDF',
			last: '25 Aug 2026, 08:00', next: '01 Sep 2026, 08:00',
			owner: 'Tomas Lindqvist', status: 'active'
		},
		{
			id: 'S-102', name: 'Monthly Revenue Summary', type: 'Invoices', freq: 'Monthly',
			detail: '1st of the month, 06:00', recipients: ['Finance', '+2'], format: 'Excel',
			last: '01 Aug 2026, 06:00', next: '01 Sep 2026, 06:00',
			owner: 'Ellis Vandermeer', status: 'active'
		},
		{
			id: 'S-103', name: 'Daily Lead Intake', type: 'Leads', freq: 'Daily',
			detail: 'Every day, 07:30', recipients: ['SDR Team', '+8'], format: 'CSV',
			last: '25 Aug 2026, 07:30', next: '26 Aug 2026, 07:30',
			owner: 'Adrian Herrera', status: 'active'
		},
		{
			id: 'S-104', name: 'Quarterly Forecast Pack', type: 'Forecast', freq: 'Quarterly',
			detail: 'First day of the quarter, 09:00', recipients: ['Board', '+6'], format: 'PDF',
			last: '01 Jul 2026, 09:00', next: '01 Oct 2026, 09:00',
			owner: 'Tomas Lindqvist', status: 'active'
		},
		{
			id: 'S-105', name: 'Win/Loss Debrief', type: 'Deals', freq: 'Monthly',
			detail: 'Last Friday, 16:00', recipients: ['Sales Leadership', '+3'], format: 'PDF',
			last: '25 Jul 2026, 16:00', next: '—',
			owner: 'Priya Raghunathan', status: 'paused'
		},
		{
			id: 'S-106', name: 'Support SLA Breaches', type: 'Tickets', freq: 'Weekly',
			detail: 'Every Friday, 17:00', recipients: ['Support Leads', '+2'], format: 'Excel',
			last: '22 Aug 2026, 17:00', next: '29 Aug 2026, 17:00',
			owner: 'Nadia Okonkwo', status: 'active'
		},
		{
			id: 'S-107', name: 'Stale Deal Alert', type: 'Deals', freq: 'Weekly',
			detail: 'Every Wednesday, 10:00', recipients: ['Account Executives', '+11'], format: 'CSV',
			last: '20 Aug 2026, 10:00', next: '27 Aug 2026, 10:00',
			owner: 'Adrian Herrera', status: 'failed'
		}
	];

	var state = { q: '', freq: 'all', status: 'all', format: 'all' };

	var body = root.querySelector('[data-sched-body]');
	var empty = root.querySelector('[data-sched-empty]');
	var countEl = root.querySelector('[data-sched-count]');

	var STATUS = {
		active: { label: 'Active', tone: 'success' },
		paused: { label: 'Paused', tone: 'warning' },
		failed: { label: 'Last run failed', tone: 'danger' }
	};

	var FORMAT_ICON = { PDF: 'ti-file-type-pdf', Excel: 'ti-file-type-xls', CSV: 'ti-file-spreadsheet' };

	function row(s) {
		var st = STATUS[s.status];
		return '<tr>' +
			'<td><button type="button" class="fw-medium text-dark bg-transparent border-0 p-0 text-start" ' +
			'data-sched-open="' + s.id + '">' + R.esc(s.name) + '</button>' +
			'<span class="fs-12 text-muted d-block">' + s.id + '</span></td>' +
			'<td><span class="badge bg-soft-secondary text-secondary">' + s.type + '</span></td>' +
			'<td>' + s.freq + '<span class="fs-12 text-muted d-block">' + s.detail + '</span></td>' +
			'<td><span class="badge bg-soft-primary text-primary">' + s.recipients[0] + '</span> ' +
			'<span class="fs-12 text-muted">' + s.recipients[1] + '</span></td>' +
			'<td><i class="ti ' + (FORMAT_ICON[s.format] || 'ti-file') + ' me-1"></i>' + s.format + '</td>' +
			'<td>' + s.last + '</td>' +
			'<td>' + s.next + '</td>' +
			'<td>' + s.owner + '</td>' +
			'<td><span class="badge bg-soft-' + st.tone + ' text-' + st.tone + '">' + st.label + '</span></td>' +
			'<td class="no-sort"><div class="dropdown">' +
			'<a href="javascript:void(0);" class="btn btn-icon btn-sm btn-outline-light shadow" ' +
			'data-bs-toggle="dropdown" aria-expanded="false" aria-label="Actions">' +
			'<i class="ti ti-dots-vertical"></i></a>' +
			'<ul class="dropdown-menu dropdown-menu-end p-2">' +
			'<li><button type="button" class="dropdown-item" data-sched-open="' + s.id + '">' +
			'<i class="ti ti-edit me-1"></i>Edit</button></li>' +
			'<li><button type="button" class="dropdown-item" data-sched-toggle="' + s.id + '">' +
			'<i class="ti ' + (s.status === 'paused' ? 'ti-player-play' : 'ti-player-pause') + ' me-1"></i>' +
			(s.status === 'paused' ? 'Resume' : 'Pause') + '</button></li>' +
			'<li><button type="button" class="dropdown-item" data-sched-run="' + s.id + '">' +
			'<i class="ti ti-send me-1"></i>Run now</button></li>' +
			'<li><button type="button" class="dropdown-item" data-sched-history="' + s.id + '">' +
			'<i class="ti ti-history me-1"></i>View history</button></li>' +
			'<li><button type="button" class="dropdown-item text-danger" data-sched-del="' + s.id + '">' +
			'<i class="ti ti-trash me-1"></i>Delete</button></li>' +
			'</ul></div></td>' +
			'</tr>';
	}

	function visible(s) {
		if (state.freq !== 'all' && s.freq !== state.freq) return false;
		if (state.status !== 'all' && s.status !== state.status) return false;
		if (state.format !== 'all' && s.format !== state.format) return false;
		if (state.q) {
			var hay = (s.name + ' ' + s.type + ' ' + s.owner).toLowerCase();
			if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
		}
		return true;
	}

	function render() {
		var rows = SCHEDULES.filter(visible);
		body.innerHTML = rows.map(row).join('');
		if (countEl) countEl.textContent = rows.length + ' of ' + SCHEDULES.length + ' schedules';
		if (empty) empty.classList.toggle('d-none', rows.length > 0);

		// summary tiles
		var counts = { active: 0, paused: 0, failed: 0 };
		SCHEDULES.forEach(function (s) { counts[s.status]++; });
		Object.keys(counts).forEach(function (k) {
			var el = root.querySelector('[data-sched-stat="' + k + '"]');
			if (el) el.textContent = counts[k];
		});
	}

	function find(id) {
		return SCHEDULES.filter(function (s) { return s.id === id; })[0];
	}

	root.addEventListener('click', function (e) {
		var t;

		if ((t = e.target.closest('[data-sched-toggle]'))) {
			var s = find(t.getAttribute('data-sched-toggle'));
			s.status = s.status === 'paused' ? 'active' : 'paused';
			if (s.status === 'paused') s.next = '—';
			else s.next = '01 Sep 2026, 08:00';
			render();
			R.notify(root, s.name + (s.status === 'paused' ? ' paused.' : ' resumed.'),
				s.status === 'paused' ? 'warning' : 'success');
			return;
		}
		if ((t = e.target.closest('[data-sched-run]'))) {
			R.notify(root, find(t.getAttribute('data-sched-run')).name + ' queued to run now.');
			return;
		}
		if ((t = e.target.closest('[data-sched-del]'))) {
			var id = t.getAttribute('data-sched-del');
			var at = SCHEDULES.indexOf(find(id));
			var name = SCHEDULES[at].name;
			SCHEDULES.splice(at, 1);
			render();
			R.notify(root, name + ' deleted.', 'danger');
			return;
		}
		if ((t = e.target.closest('[data-sched-history]'))) {
			openHistory(find(t.getAttribute('data-sched-history')));
			return;
		}
		if ((t = e.target.closest('[data-sched-open]'))) {
			openDetail(find(t.getAttribute('data-sched-open')));
		}
	});

	// ---- detail modal ---------------------------------------------------
	var modal = document.getElementById('schedule_modal');

	function openDetail(s) {
		if (!modal || !window.bootstrap) return;
		modal.querySelector('[data-sd-title]').textContent = s ? 'Edit schedule' : 'Create schedule';
		modal.querySelector('[data-sd-name]').value = s ? s.name : '';
		modal.querySelector('[data-sd-report]').value = s ? s.type : 'Deals';
		modal.querySelector('[data-sd-freq]').value = s ? s.freq : 'Weekly';
		modal.querySelector('[data-sd-format]').value = s ? s.format : 'PDF';
		modal.querySelector('[data-sd-subject]').value = s
			? s.name + ' - {{period}}'
			: 'Your CRM report - {{period}}';
		window.bootstrap.Modal.getOrCreateInstance(modal).show();
	}

	// one Create Schedule button is in the page header, one in the empty state
	document.querySelectorAll('[data-sched-create]').forEach(function (btn) {
		btn.addEventListener('click', function () { openDetail(null); });
	});

	if (modal) {
		var saveBtn = modal.querySelector('[data-sd-save]');
		if (saveBtn) {
			saveBtn.addEventListener('click', function () {
				window.bootstrap.Modal.getOrCreateInstance(modal).hide();
				R.notify(root, 'Schedule saved.');
			});
		}
		// day-of-week only makes sense for weekly
		var freqSel = modal.querySelector('[data-sd-freq]');
		var dayRow = modal.querySelector('[data-sd-dayrow]');
		if (freqSel && dayRow) {
			var sync = function () {
				dayRow.classList.toggle('d-none', freqSel.value === 'Daily');
			};
			freqSel.addEventListener('change', sync);
			sync();
		}
	}

	// ---- history modal ---------------------------------------------------
	var histModal = document.getElementById('schedule_history_modal');

	var HISTORY = [
		{ when: '25 Aug 2026, 08:00', status: 'Delivered', tone: 'success', note: '6 recipients · 248 KB PDF' },
		{ when: '18 Aug 2026, 08:00', status: 'Delivered', tone: 'success', note: '6 recipients · 244 KB PDF' },
		{ when: '11 Aug 2026, 08:00', status: 'Delivered', tone: 'success', note: '5 recipients · 240 KB PDF' },
		{ when: '04 Aug 2026, 08:00', status: 'Failed', tone: 'danger', note: 'SMTP timeout - retried and delivered' },
		{ when: '28 Jul 2026, 08:00', status: 'Delivered', tone: 'success', note: '5 recipients · 236 KB PDF' }
	];

	function openHistory(s) {
		if (!histModal || !window.bootstrap) return;
		histModal.querySelector('[data-sh-name]').textContent = s.name;
		histModal.querySelector('[data-sh-body]').innerHTML = HISTORY.map(function (h) {
			return '<tr><td>' + h.when + '</td>' +
				'<td><span class="badge bg-soft-' + h.tone + ' text-' + h.tone + '">' + h.status + '</span></td>' +
				'<td>' + h.note + '</td></tr>';
		}).join('');
		window.bootstrap.Modal.getOrCreateInstance(histModal).show();
	}

	// ---- filters ----------------------------------------------------------
	root.querySelectorAll('[data-sched-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			state[sel.getAttribute('data-sched-filter')] = sel.value;
			render();
		});
	});
	var search = root.querySelector('[data-sched-search]');
	if (search) {
		search.addEventListener('input', function () {
			state.q = search.value.trim();
			render();
		});
	}

	render();

})();


/* =======================================================================
   4. Sales Forecasting  (sales-forecasting.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-forecast-page]');
	if (!root) return;
	var R = window.CRMS_REPORT;

	var VIEWS = {
		monthly: {
			cats: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
			commit: [286, 305, 322, 340, 365, 410],
			best: [104, 118, 126, 140, 158, 190],
			pipe: [150, 162, 178, 195, 216, 245],
			quota: [520, 545, 580, 610, 660, 700],
			actual: [498, 560, 561, 645, 612, 0],
			forecast: [520, 545, 590, 610, 640, 690]
		},
		quarterly: {
			cats: ['Q4 25', 'Q1 26', 'Q2 26', 'Q3 26'],
			commit: [742, 810, 913, 1075],
			best: [286, 312, 348, 466],
			pipe: [402, 448, 490, 656],
			quota: [1400, 1520, 1680, 1920],
			actual: [1382, 1498, 1718, 0],
			forecast: [1420, 1510, 1690, 1880]
		},
		yearly: {
			cats: ['2023', '2024', '2025', '2026'],
			commit: [2180, 2640, 3120, 3540],
			best: [820, 960, 1140, 1412],
			pipe: [1180, 1360, 1590, 1996],
			quota: [4200, 4900, 5600, 6520],
			actual: [4080, 4820, 5710, 4598],
			forecast: [4180, 4890, 5640, 6350]
		}
	};

	var view = 'monthly';

	function drawAll() {
		var d = VIEWS[view];

		// revenue forecast + quota line
		R.chart('#fc_revenue_chart', {
			chart: { type: 'line', height: 260, stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Commit', type: 'column', data: d.commit },
				{ name: 'Best Case', type: 'column', data: d.best },
				{ name: 'Pipeline', type: 'column', data: d.pipe },
				{ name: 'Quota', type: 'line', data: d.quota }
			],
			colors: [R.COLOR.success, R.COLOR.info, R.COLOR.warning, R.COLOR.primary],
			stroke: { width: [0, 0, 0, 3], curve: 'smooth', dashArray: [0, 0, 0, 5] },
			plotOptions: { bar: { columnWidth: '48%', borderRadius: 3, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
			dataLabels: { enabled: false },
			xaxis: { categories: d.cats, labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { offsetX: -15, formatter: function (v) { return '$' + v + 'K'; }, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true, intersect: false, y: { formatter: function (v) { return '$' + v + 'K'; } } }
		});

		// pipeline trend
		R.chart('#fc_pipeline_chart', {
			chart: { type: 'area', height: 260, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [{ name: 'Open pipeline', data: d.commit.map(function (v, i) { return v + d.best[i] + d.pipe[i]; }) }],
			colors: [R.COLOR.primary],
			stroke: { curve: 'smooth', width: 2 },
			fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
			dataLabels: { enabled: false },
			xaxis: { categories: d.cats, labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { offsetX: -15, formatter: function (v) { return '$' + v + 'K'; }, style: { fontSize: '12px' } } },
			grid: R.GRID
		});

		// quota vs actual
		R.chart('#fc_quota_chart', {
			chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Quota', data: d.quota },
				{ name: 'Actual', data: d.actual }
			],
			colors: [R.COLOR.grey, R.COLOR.success],
			plotOptions: { bar: { columnWidth: '55%', borderRadius: 3, borderRadiusApplication: 'end' } },
			dataLabels: { enabled: false },
			xaxis: { categories: d.cats, labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: {  offsetX: -15, formatter: function (v) { return '$' + v + 'K'; }, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true, intersect: false, y: { formatter: function (v) { return v === 0 ? 'In progress' : '$' + v + 'K'; } } }
		});

		// forecast vs actual (accuracy)
		R.chart('#fc_accuracy_chart', {
			chart: { type: 'line', height: 260, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Forecast', data: d.forecast },
				{ name: 'Actual', data: d.actual }
			],
			colors: [R.COLOR.primary, R.COLOR.success],
			stroke: { curve: 'smooth', width: [2, 2], dashArray: [5, 0] },
			dataLabels: { enabled: false },
			markers: { size: 4 },
			xaxis: { categories: d.cats, labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: {  offsetX: -15, formatter: function (v) { return '$' + v + 'K'; }, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true, y: { formatter: function (v) { return v === 0 ? 'In progress' : '$' + v + 'K'; } } }
		});

		// forecast category split
		R.chart('#fc_category_chart', {
			chart: { type: 'donut', height: 250, fontFamily: 'inherit' },
			series: [410, 190, 245, 612, 148],
			labels: ['Commit', 'Best Case', 'Pipeline', 'Closed Won', 'Closed Lost'],
			colors: [R.COLOR.success, R.COLOR.info, R.COLOR.warning, '#0F9D58', R.COLOR.danger],
			stroke: { width: 0 },
			dataLabels: { enabled: false },
			legend: { position: 'bottom', fontSize: '12px', markers: { radius: 3 } },
			plotOptions: { pie: { donut: { size: '68%' } } },
			tooltip: { y: { formatter: function (v) { return '$' + v + 'K'; } } }
		});

		// stage-based forecast
		R.chart('#fc_stage_chart', {
			chart: { type: 'bar', height: 285, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [{ name: 'Weighted', data: [62, 98, 186, 264, 235] }],
			colors: [R.COLOR.primary],
			plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '58%', distributed: true } },
			legend: { show: false },
			dataLabels: { enabled: true, formatter: function (v) { return '$' + v + 'K'; } },
			xaxis: {
				categories: ['Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review'],
				labels: { style: { fontSize: '12px' } }
			},
			grid: R.GRID
		});

		var lbl = root.querySelector('[data-fc-view-label]');
		if (lbl) lbl.textContent = view.charAt(0).toUpperCase() + view.slice(1);
	}

	R.toggleGroup(root, 'data-fc-view', function (v) {
		view = v;
		drawAll();
	});

	// filters just re-render with a confirmation; the dataset is static
	root.querySelectorAll('[data-fc-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			drawAll();
			R.notify(root, 'Forecast filtered by ' +
				sel.options[sel.selectedIndex].text + '.');
		});
	});

	var reset = root.querySelector('[data-fc-reset]');
	if (reset) {
		reset.addEventListener('click', function () {
			root.querySelectorAll('[data-fc-filter]').forEach(function (s) { s.value = 'all'; });
			drawAll();
			R.notify(root, 'Filters cleared.', 'warning');
		});
	}

	R.bars(root);
	drawAll();

})();


/* =======================================================================
   5. Win/Loss Analysis  (win-loss-analysis.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-winloss]');
	if (!root) return;
	var R = window.CRMS_REPORT;

	function draw() {
		// win/loss trend
		R.chart('#wl_trend_chart', {
			chart: { type: 'bar', height: 320, stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Won', data: [14, 17, 15, 21, 19, 24] },
				{ name: 'Lost', data: [11, 9, 13, 10, 12, 9] }
			],
			colors: [R.COLOR.success, R.COLOR.danger],
			plotOptions: { bar: { columnWidth: '48%', borderRadius: 3, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
			dataLabels: { enabled: false },
			xaxis: { categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { offsetX: -15, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true, intersect: false, y: { formatter: function (v) { return v + ' deals'; } } }
		});

		// lost reasons
		R.chart('#wl_reason_chart', {
			chart: { type: 'bar', height: 320, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [{ name: 'Lost deals', data: [18, 14, 11, 8, 6, 4] }],
			colors: [R.COLOR.danger],
			plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '58%' } },
			dataLabels: { enabled: true },
			xaxis: {
				categories: ['Price too high', 'Lost to competitor', 'No budget',
					'No decision', 'Missing feature', 'Bad timing'],
				labels: {style: { fontSize: '12px' } }
			},
			grid: R.GRID
		});

		// competitor analysis
		R.chart('#wl_competitor_chart', {
			chart: { type: 'bar', height: 280, stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Won against', data: [12, 8, 9, 5] },
				{ name: 'Lost to', data: [6, 11, 4, 7] }
			],
			colors: [R.COLOR.success, R.COLOR.danger],
			plotOptions: { bar: { columnWidth: '46%', borderRadius: 3, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
			dataLabels: { enabled: false },
			xaxis: { categories: ['Northstar CRM', 'Vantage Suite', 'Apex Cloud', 'In-house build'], labels: { style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			yaxis: { labels: { offsetX: -15, style: { fontSize: '12px' } } },
			grid: R.GRID,
			tooltip: { shared: true, intersect: false }
		});

		// sales-cycle comparison
		R.chart('#wl_cycle_chart', {
			chart: { type: 'bar', height: 280, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Won', data: [34, 41, 38, 46] },
				{ name: 'Lost', data: [58, 64, 71, 62] }
			],
			colors: [R.COLOR.success, R.COLOR.danger],
			plotOptions: { bar: { columnWidth: '50%', borderRadius: 3, borderRadiusApplication: 'end' } },
			dataLabels: { enabled: false },
			xaxis: { categories: ['< $25K', '$25-50K', '$50-100K', '> $100K'], labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { formatter: function (v) { return v + 'd'; }, offsetX: -15, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true, intersect: false, y: { formatter: function (v) { return v + ' days'; } } }
		});
	}

	// breakdown tabs share one table body
	var BREAKDOWN = {
		rep: {
			head: ['Sales Rep', 'Deals', 'Won', 'Lost', 'Win Rate', 'Avg. Value', ''],
			rows: [
				['Ellis Vandermeer', 34, 24, 10, 71, '$46,200', 'manage-users.html'],
				['Adrian Herrera', 41, 27, 14, 66, '$52,800', 'manage-users.html'],
				['Priya Raghunathan', 29, 17, 12, 59, '$38,400', 'manage-users.html'],
				['Tomas Lindqvist', 33, 18, 15, 55, '$61,500', 'manage-users.html'],
				['Nadia Okonkwo', 26, 12, 14, 46, '$29,700', 'manage-users.html']
			]
		},
		industry: {
			head: ['Industry', 'Deals', 'Won', 'Lost', 'Win Rate', 'Avg. Value', ''],
			rows: [
				['Financial Services', 38, 26, 12, 68, '$58,900', 'companies.html'],
				['Healthcare', 31, 20, 11, 65, '$47,300', 'companies.html'],
				['Technology', 34, 20, 14, 59, '$41,600', 'companies.html'],
				['Logistics', 28, 15, 13, 54, '$36,200', 'companies.html'],
				['Manufacturing', 22, 9, 13, 41, '$33,800', 'companies.html'],
				['Media', 10, 8, 2, 80, '$24,100', 'companies.html']
			]
		},
		source: {
			head: ['Source', 'Deals', 'Won', 'Lost', 'Win Rate', 'Avg. Value', ''],
			rows: [
				['Referral', 24, 19, 5, 79, '$54,700', 'leads.html'],
				['Webinar', 29, 18, 11, 62, '$38,900', 'leads.html'],
				['Outbound', 42, 24, 18, 57, '$49,200', 'leads.html'],
				['Trade Show', 31, 16, 15, 52, '$42,600', 'leads.html'],
				['Paid Search', 37, 11, 26, 30, '$27,400', 'leads.html']
			]
		},
		size: {
			head: ['Deal Size', 'Deals', 'Won', 'Lost', 'Win Rate', 'Avg. Cycle', ''],
			rows: [
				['Under $25K', 52, 36, 16, 69, '34 days', 'deals.html'],
				['$25K - $50K', 48, 29, 19, 60, '41 days', 'deals.html'],
				['$50K - $100K', 41, 21, 20, 51, '52 days', 'deals.html'],
				['Over $100K', 22, 12, 10, 55, '61 days', 'deals.html']
			]
		},
		product: {
			head: ['Product', 'Deals', 'Won', 'Lost', 'Win Rate', 'Avg. Value', ''],
			rows: [
				['CRM Platform', 61, 40, 21, 66, '$52,400', 'products.html'],
				['Analytics Add-on', 38, 24, 14, 63, '$28,900', 'products.html'],
				['Support Plus', 33, 19, 14, 58, '$18,600', 'products.html'],
				['Migration Service', 31, 15, 16, 48, '$34,100', 'products.html']
			]
		}
	};

	var tbody = root.querySelector('[data-wl-body]');
	var thead = root.querySelector('[data-wl-head]');

	function renderBreakdown(kind) {
		var d = BREAKDOWN[kind];
		if (!d || !tbody) return;

		thead.innerHTML = '<tr>' + d.head.map(function (h) {
			return '<th scope="col">' + (h || '<span class="visually-hidden">Actions</span>') + '</th>';
		}).join('') + '</tr>';

		tbody.innerHTML = d.rows.map(function (r) {
			var rate = r[4];
			var tone = rate >= 65 ? 'success' : (rate >= 50 ? 'warning' : 'danger');
			return '<tr>' +
				'<td class="fw-medium text-dark">' + r[0] + '</td>' +
				'<td>' + r[1] + '</td>' +
				'<td><span class="text-success">' + r[2] + '</span></td>' +
				'<td><span class="text-danger">' + r[3] + '</span></td>' +
				'<td><div class="d-flex align-items-center gap-2">' +
				'<div class="rep-winloss flex-grow-1" style="min-width:70px;">' +
				'<span class="rep-won" style="width:' + rate + '%"></span>' +
				'<span class="rep-lost" style="width:' + (100 - rate) + '%"></span></div>' +
				'<span class="badge bg-soft-' + tone + ' text-' + tone + '">' + rate + '%</span></div></td>' +
				'<td>' + r[5] + '</td>' +
				'<td class="no-sort"><a href="' + r[6] + '" class="btn btn-sm btn-outline-light shadow">' +
				'<i class="ti ti-eye me-1"></i>View Details</a></td>' +
				'</tr>';
		}).join('');
	}

	R.toggleGroup(root, 'data-wl-tab', function (k) { renderBreakdown(k); });

	root.querySelectorAll('[data-wl-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			R.notify(root, 'Filtered by ' + sel.options[sel.selectedIndex].text + '.');
		});
	});
	var reset = root.querySelector('[data-wl-reset]');
	if (reset) {
		reset.addEventListener('click', function () {
			root.querySelectorAll('[data-wl-filter]').forEach(function (s) { s.value = 'all'; });
			R.notify(root, 'Filters cleared.', 'warning');
		});
	}

	R.bars(root);
	renderBreakdown('rep');
	draw();

})();


/* =======================================================================
   6. Sales Velocity  (sales-velocity.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-velocity]');
	if (!root) return;
	var R = window.CRMS_REPORT;

	// Sales velocity = opportunities x avg deal value x win rate / cycle length
	var PERIODS = {
		current: { opps: 53, value: 42400, win: 0.61, cycle: 46, label: 'This Quarter' },
		previous: { opps: 48, value: 39800, win: 0.57, cycle: 52, label: 'Last Quarter' },
		target: { opps: 60, value: 45000, win: 0.65, cycle: 42, label: 'Target' }
	};

	function velocity(p) {
		return (p.opps * p.value * p.win) / p.cycle;
	}

	function renderFormula() {
		var p = PERIODS.current;
		var el = root.querySelector('[data-vel-formula]');
		if (!el) return;
		el.innerHTML =
			part(p.opps, 'Opportunities') + op('&times;') +
			part(R.money(p.value), 'Avg. deal value') + op('&times;') +
			part(Math.round(p.win * 100) + '%', 'Win rate') + op('&divide;') +
			part(p.cycle + ' days', 'Sales cycle') + op('=') +
			'<div class="rep-formula-part rep-formula-result">' +
			'<span class="rep-formula-value">' + R.money(Math.round(velocity(p))) + '</span>' +
			'<span class="rep-formula-label">per day</span></div>';

		function part(v, l) {
			return '<div class="rep-formula-part"><span class="rep-formula-value">' + v +
				'</span><span class="rep-formula-label">' + l + '</span></div>';
		}
		function op(sym) {
			return '<span class="rep-formula-op">' + sym + '</span>';
		}
	}

	function renderComparison() {
		var body = root.querySelector('[data-vel-compare]');
		if (!body) return;
		var cur = PERIODS.current;

		var rows = [
			['Sales velocity', function (p) { return R.money(Math.round(velocity(p))); },
				function (p) { return velocity(p); }],
			['Opportunities', function (p) { return p.opps; }, function (p) { return p.opps; }],
			['Avg. deal value', function (p) { return R.money(p.value); }, function (p) { return p.value; }],
			['Win rate', function (p) { return Math.round(p.win * 100) + '%'; }, function (p) { return p.win; }],
			['Sales cycle', function (p) { return p.cycle + ' days'; }, function (p) { return -p.cycle; }]
		];

		body.innerHTML = rows.map(function (r) {
			var cv = r[2](cur);
			var pv = r[2](PERIODS.previous);
			var tv = r[2](PERIODS.target);
			var vsPrev = Math.round(((cv - pv) / Math.abs(pv)) * 100);
			var vsTarget = Math.round(((cv - tv) / Math.abs(tv)) * 100);
			return '<tr>' +
				'<td class="fw-medium text-dark">' + r[0] + '</td>' +
				'<td>' + r[1](cur) + '</td>' +
				'<td>' + r[1](PERIODS.previous) + '</td>' +
				'<td>' + R.delta(vsPrev) + '</td>' +
				'<td>' + r[1](PERIODS.target) + '</td>' +
				'<td>' + R.delta(vsTarget) + '</td>' +
				'</tr>';
		}).join('');
	}

	function draw() {
		// velocity trend + its inputs
		R.chart('#vel_trend_chart', {
			chart: { type: 'line', height: 320, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Sales velocity', type: 'area', data: [21400, 23100, 24800, 26200, 28400, 29800] },
				{ name: 'Target', type: 'line', data: [26000, 26500, 27000, 27500, 28000, 28500] }
			],
			colors: [R.COLOR.primary, R.COLOR.grey],
			stroke: { curve: 'smooth', width: [2, 2], dashArray: [0, 5] },
			fill: { type: ['gradient', 'solid'], gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
			dataLabels: { enabled: false },
			xaxis: { categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { formatter: function (v) { return R.moneyShort(v); }, offsetX: -15, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true, y: { formatter: function (v) { return R.money(v) + ' / day'; } } }
		});

		// by team
		R.chart('#vel_team_chart', {
			chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [{ name: 'Velocity', data: [38200, 27400, 18900] }],
			colors: [R.COLOR.success, R.COLOR.primary, R.COLOR.warning],
			plotOptions: { bar: { columnWidth: '45%', borderRadius: 3, distributed: true, borderRadiusApplication: 'end' } },
			legend: { show: false },
			dataLabels: { enabled: false },
			xaxis: { categories: ['Enterprise', 'Mid-Market', 'SMB'], labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { formatter: function (v) { return R.moneyShort(v); }, offsetX: -15, style: { fontSize: '12px' } } },
			grid: R.GRID,
			tooltip: { y: { formatter: function (v) { return R.money(v) + ' / day'; } } }
		});

		// by rep
		R.chart('#vel_rep_chart', {
			chart: { type: 'bar', height: 270, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [{ name: 'Velocity', data: [34800, 31200, 27600, 24100, 19400] }],
			colors: [R.COLOR.primary],
			plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '58%' } },
			dataLabels: { enabled: false },
			xaxis: {
				categories: ['Ellis Vandermeer', 'Adrian Herrera', 'Priya Raghunathan',
					'Tomas Lindqvist', 'Nadia Okonkwo'],
				labels: { style: { fontSize: '11px' } }
			},
			grid: R.GRID,
			tooltip: { y: { formatter: function (v) { return R.money(v) + ' / day'; } } }
		});

		// the four inputs over time
		R.chart('#vel_inputs_chart', {
			chart: { type: 'line', height: 280, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [
				{ name: 'Opportunities', data: [41, 44, 46, 49, 51, 53] },
				{ name: 'Win rate %', data: [52, 54, 56, 58, 60, 61] },
				{ name: 'Cycle (days)', data: [58, 55, 53, 50, 48, 46] }
			],
			colors: [R.COLOR.primary, R.COLOR.success, R.COLOR.warning],
			stroke: { curve: 'smooth', width: 2 },
			dataLabels: { enabled: false },
			markers: { size: 3 },
			xaxis: { categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { offsetX: -15, style: { fontSize: '12px' } } },
			legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
			grid: R.GRID,
			tooltip: { shared: true }
		});

		// deal value trend
		R.chart('#vel_value_chart', {
			chart: { type: 'area', height: 280, toolbar: { show: false }, fontFamily: 'inherit' },
			series: [{ name: 'Avg. deal value', data: [36200, 37400, 38900, 40100, 41300, 42400] }],
			colors: [R.COLOR.info],
			stroke: { curve: 'smooth', width: 2 },
			fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
			dataLabels: { enabled: false },
			xaxis: { categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], labels: { style: { fontSize: '12px' } } },
			yaxis: { labels: { offsetX:-15, formatter: function (v) { return R.moneyShort(v); }, style: { fontSize: '12px' } } },
			grid: R.GRID,
			tooltip: { y: { formatter: function (v) { return R.money(v); } } }
		});
	}

	// stage / source / product breakdown reuses one table
	var VEL_BREAKDOWN = {
		stage: [
			['Qualification', 18, '$28,400', '32%', '12 days', '$13,100'],
			['Needs Analysis', 14, '$34,900', '44%', '15 days', '$14,300'],
			['Proposal Sent', 11, '$41,600', '56%', '19 days', '$13,500'],
			['Negotiation', 7, '$58,200', '74%', '14 days', '$21,500'],
			['Contract Review', 3, '$72,800', '91%', '9 days', '$22,100']
		],
		source: [
			['Referral', 9, '$54,700', '79%', '38 days', '$10,200'],
			['Webinar', 12, '$38,900', '62%', '44 days', '$6,600'],
			['Outbound', 16, '$49,200', '57%', '49 days', '$9,200'],
			['Trade Show', 9, '$42,600', '52%', '47 days', '$4,200'],
			['Paid Search', 7, '$27,400', '30%', '55 days', '$1,000']
		],
		product: [
			['CRM Platform', 21, '$52,400', '66%', '45 days', '$16,100'],
			['Analytics Add-on', 13, '$28,900', '63%', '41 days', '$5,800'],
			['Support Plus', 11, '$18,600', '58%', '36 days', '$3,300'],
			['Migration Service', 8, '$34,100', '48%', '52 days', '$2,500']
		]
	};

	var velBody = root.querySelector('[data-vel-body]');
	var velLabel = root.querySelector('[data-vel-dim-label]');

	function renderVelBreakdown(kind) {
		if (!velBody) return;
		velBody.innerHTML = VEL_BREAKDOWN[kind].map(function (r) {
			return '<tr>' +
				'<td class="fw-medium text-dark">' + r[0] + '</td>' +
				'<td>' + r[1] + '</td>' +
				'<td>' + r[2] + '</td>' +
				'<td>' + r[3] + '</td>' +
				'<td>' + r[4] + '</td>' +
				'<td class="fw-medium text-dark">' + r[5] + '</td>' +
				'<td class="no-sort"><a href="deals.html" class="btn btn-sm btn-outline-light shadow">' +
				'<i class="ti ti-eye me-1"></i>View Deals</a></td></tr>';
		}).join('');
		if (velLabel) {
			velLabel.textContent = kind.charAt(0).toUpperCase() + kind.slice(1);
		}
	}

	R.toggleGroup(root, 'data-vel-dim', function (k) { renderVelBreakdown(k); });

	root.querySelectorAll('[data-vel-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			R.notify(root, 'Filtered by ' + sel.options[sel.selectedIndex].text + '.');
		});
	});

	R.bars(root);
	renderFormula();
	renderComparison();
	renderVelBreakdown('stage');
	draw();

})();
