/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
Description  : Automation module - Automation Rules, Webhooks and Automation Logs.

One file for the three management pages; the Workflow Builder keeps its own
assets/js/workflow-builder.js. Each section is a guarded IIFE that
early-returns when its page marker is absent.

Static template: mock data only. No rule engine, no webhook delivery and no
API calls are made anywhere in this file.

Sections
--------
   1. Shared helpers
   2. Automation Rules  (automation-rules.html)
   3. Webhooks          (webhooks.html)
   4. Automation Logs   (automation-logs.html)
*/


/* =======================================================================
   1. Shared helpers
   ======================================================================= */
window.CRMS_AUTOMATION = (function () {
	"use strict";

	function esc(str) {
		return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}

	function notify(message, tone) {
		var box = document.querySelector('[data-automation-toast]');
		if (!box) return;
		box.className = 'alert alert-' + (tone || 'success') + ' py-2 px-3 fs-13 mb-3';
		box.textContent = message;
		box.classList.remove('d-none');
		window.clearTimeout(box._t);
		box._t = window.setTimeout(function () { box.classList.add('d-none'); }, 2800);
	}

	function badge(text, tone) {
		return '<span class="badge bg-soft-' + tone + ' text-' + tone + '">' + text + '</span>';
	}

	// success-rate bar reusing the existing meter component
	function meter(pct) {
		var tone = pct >= 95 ? 'is-success' : (pct >= 80 ? 'is-warning' : 'is-danger');
		return '<span class="ai-meter ' + tone + '"><span class="ai-meter-track">' +
			'<span class="ai-meter-fill" style="width:' + pct + '%"></span></span>' +
			'<span class="ai-meter-value">' + pct + '%</span></span>';
	}

	// mask everything but the last 4 characters of a secret
	function mask(value) {
		var s = String(value || '');
		if (s.length <= 4) return '••••';
		return '••••••••••••' + s.slice(-4);
	}

	function modal(id) {
		var el = document.getElementById(id);
		if (!el || !window.bootstrap) return null;
		return window.bootstrap.Modal.getOrCreateInstance(el);
	}

	return { esc: esc, notify: notify, badge: badge, meter: meter, mask: mask, modal: modal };
})();


/* =======================================================================
   2. Automation Rules  (automation-rules.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-automation-rules]');
	if (!root) return;
	var A = window.CRMS_AUTOMATION;

	var RULES = [
		{
			id: 'R-201', name: 'Automatically assign new leads', applies: 'Leads',
			trigger: 'Lead Created', conditions: 'Region is North America',
			action: 'Assign user (round robin)', status: 'active',
			runs: 1482, success: 99, last: '25 Aug 2026, 09:12',
			owner: 'Adrian Herrera', created: '04 Mar 2026',
			link: 'leads.html'
		},
		{
			id: 'R-202', name: 'Notify sales manager for high-value deals', applies: 'Deals',
			trigger: 'Deal Created', conditions: 'Deal value > $100,000',
			action: 'Send notification', status: 'active',
			runs: 214, success: 100, last: '25 Aug 2026, 08:40',
			owner: 'Tomas Lindqvist', created: '18 Mar 2026',
			link: 'deals.html'
		},
		{
			id: 'R-203', name: 'Create follow-up after proposal submission', applies: 'Proposals',
			trigger: 'Proposal Created', conditions: 'Status is Sent',
			action: 'Create task', status: 'active',
			runs: 386, success: 97, last: '24 Aug 2026, 16:05',
			owner: 'Priya Raghunathan', created: '22 Apr 2026',
			link: 'proposals.html'
		},
		{
			id: 'R-204', name: 'Alert account owner before contract expiry', applies: 'Contracts',
			trigger: 'Contract Expiring', conditions: 'Renewal within 30 days',
			action: 'Send email + create follow-up', status: 'active',
			runs: 92, success: 98, last: '24 Aug 2026, 07:00',
			owner: 'Ellis Vandermeer', created: '02 May 2026',
			link: 'contracts.html'
		},
		{
			id: 'R-205', name: 'Create task when lead becomes qualified', applies: 'Leads',
			trigger: 'Lead Qualified', conditions: 'Lead score >= 75',
			action: 'Create task', status: 'active',
			runs: 640, success: 96, last: '25 Aug 2026, 10:22',
			owner: 'Adrian Herrera', created: '11 May 2026',
			link: 'leads.html'
		},
		{
			id: 'R-206', name: 'Notify finance when invoice becomes overdue', applies: 'Invoices',
			trigger: 'Invoice Overdue', conditions: 'Amount > $5,000',
			action: 'Send notification + add tag', status: 'error',
			runs: 148, success: 71, last: '23 Aug 2026, 11:05',
			owner: 'Ellis Vandermeer', created: '30 May 2026',
			link: 'invoices.html'
		},
		{
			id: 'R-207', name: 'Assign deals based on territory', applies: 'Deals',
			trigger: 'Deal Created', conditions: 'Region is EMEA',
			action: 'Assign team', status: 'paused',
			runs: 318, success: 94, last: '19 Aug 2026, 14:31',
			owner: 'Nadia Okonkwo', created: '14 Jun 2026',
			link: 'deals.html'
		},
		{
			id: 'R-208', name: 'Notify team when a deal is won', applies: 'Deals',
			trigger: 'Deal Won', conditions: 'No conditions',
			action: 'Send notification + webhook', status: 'active',
			runs: 98, success: 100, last: '24 Aug 2026, 17:48',
			owner: 'Tomas Lindqvist', created: '01 Jul 2026',
			link: 'deals.html'
		},
		{
			id: 'R-209', name: 'Tag contacts from webinar campaigns', applies: 'Contacts',
			trigger: 'Contact Created', conditions: 'Source is Webinar',
			action: 'Add tag', status: 'draft',
			runs: 0, success: 0, last: 'Never',
			owner: 'Priya Raghunathan', created: '20 Aug 2026',
			link: 'contacts.html'
		}
	];

	var STATUS = {
		active: { label: 'Active', tone: 'success' },
		draft: { label: 'Draft', tone: 'secondary' },
		paused: { label: 'Paused', tone: 'warning' },
		error: { label: 'Error', tone: 'danger' }
	};

	var state = { q: '', status: 'all', applies: 'all', trigger: 'all', owner: 'all' };

	var body = root.querySelector('[data-rules-body]');
	var empty = root.querySelector('[data-rules-empty]');
	var countEl = root.querySelector('[data-rules-count]');

	function row(r) {
		var st = STATUS[r.status];
		return '<tr>' +
			'<td><button type="button" class="fw-medium text-dark bg-transparent border-0 p-0 text-start" ' +
			'data-rule-open="' + r.id + '">' + A.esc(r.name) + '</button>' +
			'<span class="fs-12 text-muted d-block">' + r.id + '</span></td>' +
			'<td><a href="' + r.link + '" class="badge bg-soft-secondary text-secondary">' + r.applies + '</a></td>' +
			'<td>' + r.trigger + '</td>' +
			'<td><span class="fs-12">' + A.esc(r.conditions) + '</span></td>' +
			'<td><span class="fs-12">' + A.esc(r.action) + '</span></td>' +
			'<td>' + r.runs.toLocaleString('en-US') + '</td>' +
			'<td style="min-width:150px;">' + (r.runs ? A.meter(r.success) :
				'<span class="fs-12 text-muted">Not run yet</span>') + '</td>' +
			'<td>' + r.last + '</td>' +
			'<td>' + r.owner + '</td>' +
			'<td>' + r.created + '</td>' +
			'<td>' + A.badge(st.label, st.tone) + '</td>' +
			'<td class="no-sort"><div class="dropdown">' +
			'<a href="javascript:void(0);" class="btn btn-icon btn-sm btn-outline-light shadow" ' +
			'data-bs-toggle="dropdown" aria-expanded="false" aria-label="Actions">' +
			'<i class="ti ti-dots-vertical"></i></a>' +
			'<ul class="dropdown-menu dropdown-menu-end p-2">' +
			'<li><button type="button" class="dropdown-item" data-rule-open="' + r.id + '">' +
			'<i class="ti ti-eye me-1"></i>View details</button></li>' +
			'<li><a class="dropdown-item" href="workflow-builder.html">' +
			'<i class="ti ti-edit me-1"></i>Edit</a></li>' +
			'<li><button type="button" class="dropdown-item" data-rule-copy="' + r.id + '">' +
			'<i class="ti ti-copy me-1"></i>Duplicate</button></li>' +
			'<li><button type="button" class="dropdown-item" data-rule-toggle="' + r.id + '">' +
			'<i class="ti ' + (r.status === 'active' ? 'ti-player-pause' : 'ti-player-play') + ' me-1"></i>' +
			(r.status === 'active' ? 'Disable' : 'Enable') + '</button></li>' +
			'<li><a class="dropdown-item" href="automation-logs.html">' +
			'<i class="ti ti-history me-1"></i>View logs</a></li>' +
			'<li><hr class="dropdown-divider"></li>' +
			'<li><button type="button" class="dropdown-item text-danger" data-rule-del="' + r.id + '">' +
			'<i class="ti ti-trash me-1"></i>Delete</button></li>' +
			'</ul></div></td>' +
			'</tr>';
	}

	function visible(r) {
		if (state.status !== 'all' && r.status !== state.status) return false;
		if (state.applies !== 'all' && r.applies !== state.applies) return false;
		if (state.trigger !== 'all' && r.trigger !== state.trigger) return false;
		if (state.owner !== 'all' && r.owner !== state.owner) return false;
		if (state.q) {
			var hay = (r.name + ' ' + r.trigger + ' ' + r.action + ' ' + r.owner).toLowerCase();
			if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
		}
		return true;
	}

	function render() {
		var rows = RULES.filter(visible);
		body.innerHTML = rows.map(row).join('');
		if (countEl) countEl.textContent = rows.length + ' of ' + RULES.length + ' rules';
		if (empty) empty.classList.toggle('d-none', rows.length > 0);

		var counts = { active: 0, draft: 0, paused: 0, error: 0 };
		RULES.forEach(function (r) { counts[r.status]++; });
		Object.keys(counts).forEach(function (k) {
			var el = root.querySelector('[data-rules-stat="' + k + '"]');
			if (el) el.textContent = counts[k];
		});
	}

	function find(id) {
		return RULES.filter(function (r) { return r.id === id; })[0];
	}

	root.addEventListener('click', function (e) {
		var t;
		if ((t = e.target.closest('[data-rule-toggle]'))) {
			var r = find(t.getAttribute('data-rule-toggle'));
			r.status = r.status === 'active' ? 'paused' : 'active';
			render();
			A.notify(r.name + (r.status === 'active' ? ' enabled.' : ' disabled.'),
				r.status === 'active' ? 'success' : 'warning');
			return;
		}
		if ((t = e.target.closest('[data-rule-copy]'))) {
			var src = find(t.getAttribute('data-rule-copy'));
			var copy = JSON.parse(JSON.stringify(src));
			copy.id = 'R-' + (300 + RULES.length);
			copy.name = src.name + ' (copy)';
			copy.status = 'draft';
			copy.runs = 0;
			copy.success = 0;
			copy.last = 'Never';
			RULES.splice(RULES.indexOf(src) + 1, 0, copy);
			render();
			A.notify('Rule duplicated as a draft.');
			return;
		}
		if ((t = e.target.closest('[data-rule-del]'))) {
			var d = find(t.getAttribute('data-rule-del'));
			RULES.splice(RULES.indexOf(d), 1);
			render();
			A.notify(d.name + ' deleted.', 'danger');
			return;
		}
		if ((t = e.target.closest('[data-rule-open]'))) {
			openRule(find(t.getAttribute('data-rule-open')));
		}
	});

	// ---- detail modal ---------------------------------------------------
	function openRule(r) {
		var el = document.getElementById('rule_modal');
		if (!el || !r) return;
		var st = STATUS[r.status];

		el.querySelector('[data-rd-name]').textContent = r.name;
		el.querySelector('[data-rd-id]').textContent = r.id + ' · created ' + r.created + ' by ' + r.owner;
		el.querySelector('[data-rd-status]').innerHTML = A.badge(st.label, st.tone);
		el.querySelector('[data-rd-applies]').textContent = r.applies;
		el.querySelector('[data-rd-trigger]').textContent = r.trigger;
		el.querySelector('[data-rd-conditions]').textContent = r.conditions;
		el.querySelector('[data-rd-action]').textContent = r.action;
		el.querySelector('[data-rd-runs]').textContent = r.runs.toLocaleString('en-US');
		el.querySelector('[data-rd-success]').innerHTML = r.runs ? A.meter(r.success) : '—';
		el.querySelector('[data-rd-last]').textContent = r.last;

		// the rule as a mini flow, reusing the workflow node styles
		el.querySelector('[data-rd-flow]').innerHTML =
			flowNode('trigger', 'ti-bolt', 'Trigger', r.trigger) +
			'<div class="workflow-connector"></div>' +
			flowNode('condition', 'ti-filter', 'Condition', r.conditions) +
			'<div class="workflow-connector"></div>' +
			flowNode('action', 'ti-player-play', 'Action', r.action);

		A.modal('rule_modal').show();
	}

	function flowNode(kind, icon, label, text) {
		var tint = { trigger: 'bg-soft-primary text-primary', condition: 'bg-soft-warning text-warning',
			action: 'bg-soft-success text-success' }[kind];
		return '<div class="workflow-node" data-kind="' + kind + '">' +
			'<div class="workflow-node-head">' +
			'<span class="workflow-node-icon ' + tint + '"><i class="ti ' + icon + '"></i></span>' +
			'<div><span class="workflow-node-kind">' + label + '</span>' +
			'<h6 class="workflow-node-title">' + A.esc(text) + '</h6></div></div></div>';
	}

	// ---- filters ---------------------------------------------------------
	document.querySelectorAll('[data-rules-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			state[sel.getAttribute('data-rules-filter')] = sel.value;
			render();
		});
	});
	var search = root.querySelector('[data-rules-search]');
	if (search) {
		search.addEventListener('input', function () {
			state.q = search.value.trim();
			render();
		});
	}
	document.querySelectorAll('[data-rules-reset]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			state = { q: '', status: 'all', applies: 'all', trigger: 'all', owner: 'all' };
			document.querySelectorAll('[data-rules-filter]').forEach(function (s) { s.value = 'all'; });
			if (search) search.value = '';
			render();
			A.notify('Filters cleared.', 'warning');
		});
	});

	render();

})();


/* =======================================================================
   3. Webhooks  (webhooks.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-webhooks]');
	if (!root) return;
	var A = window.CRMS_AUTOMATION;

	var HOOKS = [
		{
			id: 'WH-01', name: 'Deal won - billing sync', url: 'https://api.billing.internal/v2/crm/deal-won',
			method: 'POST', event: 'Deal Won', status: 'active',
			last: '25 Aug 2026, 08:41', code: 200, success: 100, created: '12 Mar 2026',
			auth: 'Bearer token', secret: 'whsec_9f4c2ab71d8e'
		},
		{
			id: 'WH-02', name: 'Lead created - marketing', url: 'https://hooks.marketing.example.com/crm/lead',
			method: 'POST', event: 'Lead Created', status: 'active',
			last: '25 Aug 2026, 10:14', code: 200, success: 99, created: '04 Apr 2026',
			auth: 'HMAC signature', secret: 'whsec_2d81ffa60c39'
		},
		{
			id: 'WH-03', name: 'Payment received - finance', url: 'https://finance.internal/api/payments/ingest',
			method: 'POST', event: 'Payment Received', status: 'active',
			last: '24 Aug 2026, 16:58', code: 201, success: 98, created: '19 Apr 2026',
			auth: 'Basic auth', secret: 'whsec_77b0e4c1a952'
		},
		{
			id: 'WH-04', name: 'Contact created - support desk', url: 'https://support.example.com/hooks/contact',
			method: 'POST', event: 'Contact Created', status: 'active',
			last: '25 Aug 2026, 09:03', code: 200, success: 97, created: '02 May 2026',
			auth: 'API key', secret: 'whsec_a41c9e2b7f60'
		},
		{
			id: 'WH-05', name: 'Invoice created - accounting', url: 'https://ledger.internal/v1/invoices',
			method: 'PUT', event: 'Invoice Created', status: 'failing',
			last: '23 Aug 2026, 11:07', code: 502, success: 64, created: '30 May 2026',
			auth: 'Bearer token', secret: 'whsec_5c30d81ea274'
		},
		{
			id: 'WH-06', name: 'Deal lost - analytics', url: 'https://analytics.example.com/collect/deal-lost',
			method: 'POST', event: 'Deal Lost', status: 'paused',
			last: '14 Aug 2026, 13:22', code: 200, success: 96, created: '11 Jun 2026',
			auth: 'None', secret: 'whsec_1a77b3c04de9'
		},
		{
			id: 'WH-07', name: 'Contract created - legal archive', url: 'https://legal.internal/archive/contracts',
			method: 'POST', event: 'Contract Created', status: 'active',
			last: '22 Aug 2026, 15:40', code: 200, success: 100, created: '28 Jun 2026',
			auth: 'HMAC signature', secret: 'whsec_e903f16c8b45'
		}
	];

	var STATUS = {
		active: { label: 'Active', tone: 'success' },
		paused: { label: 'Paused', tone: 'warning' },
		failing: { label: 'Failing', tone: 'danger' }
	};

	var state = { q: '', event: 'all', status: 'all' };

	var body = root.querySelector('[data-hooks-body]');
	var empty = root.querySelector('[data-hooks-empty]');
	var countEl = root.querySelector('[data-hooks-count]');

	function codeBadge(code) {
		var tone = code < 300 ? 'success' : (code < 500 ? 'warning' : 'danger');
		return A.badge(code, tone);
	}

	function row(h) {
		var st = STATUS[h.status];
		return '<tr>' +
			'<td><button type="button" class="fw-medium text-dark bg-transparent border-0 p-0 text-start" ' +
			'data-hook-open="' + h.id + '">' + A.esc(h.name) + '</button>' +
			'<span class="fs-12 text-muted d-block">' + h.id + '</span></td>' +
			'<td><code class="fs-12">' + A.esc(h.url.length > 42 ? h.url.slice(0, 42) + '…' : h.url) + '</code></td>' +
			'<td>' + A.badge(h.method, 'secondary') + '</td>' +
			'<td>' + h.event + '</td>' +
			'<td>' + h.last + '</td>' +
			'<td>' + codeBadge(h.code) + '</td>' +
			'<td style="min-width:150px;">' + A.meter(h.success) + '</td>' +
			'<td>' + h.created + '</td>' +
			'<td>' + A.badge(st.label, st.tone) + '</td>' +
			'<td class="no-sort"><div class="dropdown">' +
			'<a href="javascript:void(0);" class="btn btn-icon btn-sm btn-outline-light shadow" ' +
			'data-bs-toggle="dropdown" aria-expanded="false" aria-label="Actions">' +
			'<i class="ti ti-dots-vertical"></i></a>' +
			'<ul class="dropdown-menu dropdown-menu-end p-2">' +
			'<li><button type="button" class="dropdown-item" data-hook-open="' + h.id + '">' +
			'<i class="ti ti-edit me-1"></i>Edit</button></li>' +
			'<li><button type="button" class="dropdown-item" data-hook-test="' + h.id + '">' +
			'<i class="ti ti-plug-connected me-1"></i>Test webhook</button></li>' +
			'<li><button type="button" class="dropdown-item" data-hook-toggle="' + h.id + '">' +
			'<i class="ti ' + (h.status === 'paused' ? 'ti-player-play' : 'ti-player-pause') + ' me-1"></i>' +
			(h.status === 'paused' ? 'Enable' : 'Disable') + '</button></li>' +
			'<li><a class="dropdown-item" href="automation-logs.html">' +
			'<i class="ti ti-history me-1"></i>View logs</a></li>' +
			'<li><hr class="dropdown-divider"></li>' +
			'<li><button type="button" class="dropdown-item text-danger" data-hook-del="' + h.id + '">' +
			'<i class="ti ti-trash me-1"></i>Delete</button></li>' +
			'</ul></div></td>' +
			'</tr>';
	}

	function visible(h) {
		if (state.event !== 'all' && h.event !== state.event) return false;
		if (state.status !== 'all' && h.status !== state.status) return false;
		if (state.q) {
			var hay = (h.name + ' ' + h.url + ' ' + h.event).toLowerCase();
			if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
		}
		return true;
	}

	function render() {
		var rows = HOOKS.filter(visible);
		body.innerHTML = rows.map(row).join('');
		if (countEl) countEl.textContent = rows.length + ' of ' + HOOKS.length + ' webhooks';
		if (empty) empty.classList.toggle('d-none', rows.length > 0);

		var counts = { active: 0, paused: 0, failing: 0 };
		HOOKS.forEach(function (h) { counts[h.status]++; });
		Object.keys(counts).forEach(function (k) {
			var el = root.querySelector('[data-hooks-stat="' + k + '"]');
			if (el) el.textContent = counts[k];
		});
	}

	function find(id) {
		return HOOKS.filter(function (h) { return h.id === id; })[0];
	}

	root.addEventListener('click', function (e) {
		var t;
		if ((t = e.target.closest('[data-hook-toggle]'))) {
			var h = find(t.getAttribute('data-hook-toggle'));
			h.status = h.status === 'paused' ? 'active' : 'paused';
			render();
			A.notify(h.name + (h.status === 'paused' ? ' disabled.' : ' enabled.'),
				h.status === 'paused' ? 'warning' : 'success');
			return;
		}
		if ((t = e.target.closest('[data-hook-del]'))) {
			var d = find(t.getAttribute('data-hook-del'));
			HOOKS.splice(HOOKS.indexOf(d), 1);
			render();
			A.notify(d.name + ' deleted.', 'danger');
			return;
		}
		if ((t = e.target.closest('[data-hook-test]'))) {
			openHook(find(t.getAttribute('data-hook-test')), true);
			return;
		}
		if ((t = e.target.closest('[data-hook-open]'))) {
			openHook(find(t.getAttribute('data-hook-open')), false);
		}
	});

	// ---- configuration modal ---------------------------------------------
	var current = null;

	function payloadFor(hook) {
		return JSON.stringify({
			event: (hook ? hook.event : 'Deal Won').toLowerCase().replace(/ /g, '.'),
			occurred_at: '2026-08-25T08:41:12Z',
			data: {
				id: 'D-1094',
				name: 'Northwind Logistics - Renewal',
				amount: 96000,
				currency: 'USD',
				stage: 'Closed Won',
				owner: { id: 'U-14', name: 'Adrian Herrera' },
				company: { id: 'C-208', name: 'Northwind Logistics' }
			}
		}, null, 2);
	}

	function openHook(h, autoTest) {
		var el = document.getElementById('webhook_modal');
		if (!el) return;
		current = h;

		el.querySelector('[data-wh-title]').textContent = h ? 'Edit webhook' : 'Add webhook';
		el.querySelector('[data-wh-name]').value = h ? h.name : '';
		el.querySelector('[data-wh-url]').value = h ? h.url : '';
		el.querySelector('[data-wh-method]').value = h ? h.method : 'POST';
		el.querySelector('[data-wh-event]').value = h ? h.event : 'Deal Won';
		el.querySelector('[data-wh-auth]').value = h ? h.auth : 'Bearer token';

		var secret = el.querySelector('[data-wh-secret]');
		secret.value = h ? h.secret : '';
		secret.type = 'password';
		var eye = el.querySelector('[data-wh-eye] i');
		if (eye) eye.className = 'ti ti-eye';

		el.querySelector('[data-wh-payload]').textContent = payloadFor(h);
		el.querySelector('[data-wh-response]').innerHTML =
			'<span class="fs-12 text-muted">Run a test to see the response.</span>';

		A.modal('webhook_modal').show();
		if (autoTest) window.setTimeout(runTest, 500);
	}

	document.querySelectorAll('[data-hook-add]').forEach(function (btn) {
		btn.addEventListener('click', function () { openHook(null, false); });
	});

	function runTest() {
		var el = document.getElementById('webhook_modal');
		if (!el) return;
		var out = el.querySelector('[data-wh-response]');
		out.innerHTML = '<span class="ai-thinking"><span class="ai-thinking-dots">' +
			'<span></span><span></span><span></span></span> Sending test payload...</span>';

		window.setTimeout(function () {
			// static template: this is a canned response, nothing leaves the browser
			var failing = current && current.status === 'failing';
			var code = failing ? 502 : 200;
			var tone = failing ? 'danger' : 'success';
			out.innerHTML =
				'<div class="d-flex align-items-center gap-2 mb-2">' +
				A.badge(code + (failing ? ' Bad Gateway' : ' OK'), tone) +
				'<span class="fs-12 text-muted">' + (failing ? '5,004' : '212') + ' ms</span></div>' +
				'<pre class="mb-0 fs-12">' + (failing
					? '{\n  "error": "upstream_unavailable",\n  "retry_after": 60\n}'
					: '{\n  "received": true,\n  "id": "evt_8f21c0a4"\n}') + '</pre>';
			A.notify(failing ? 'Test failed - endpoint returned 502.' : 'Test webhook delivered.',
				failing ? 'danger' : 'success');
		}, 1100);
	}

	var testBtn = document.querySelector('[data-wh-test]');
	if (testBtn) testBtn.addEventListener('click', runTest);

	var saveBtn = document.querySelector('[data-wh-save]');
	if (saveBtn) {
		saveBtn.addEventListener('click', function () {
			A.modal('webhook_modal').hide();
			A.notify('Webhook saved.');
		});
	}

	// secret visibility toggle
	var eyeBtn = document.querySelector('[data-wh-eye]');
	if (eyeBtn) {
		eyeBtn.addEventListener('click', function () {
			var f = document.querySelector('[data-wh-secret]');
			if (!f) return;
			var show = f.type === 'password';
			f.type = show ? 'text' : 'password';
			eyeBtn.querySelector('i').className = 'ti ' + (show ? 'ti-eye-off' : 'ti-eye');
			eyeBtn.setAttribute('aria-label', show ? 'Hide secret' : 'Show secret');
		});
	}

	// event changes re-key the payload preview
	var eventSel = document.querySelector('[data-wh-event]');
	if (eventSel) {
		eventSel.addEventListener('change', function () {
			var el = document.getElementById('webhook_modal');
			el.querySelector('[data-wh-payload]').textContent =
				payloadFor({ event: eventSel.value });
		});
	}

	// ---- filters ----------------------------------------------------------
	document.querySelectorAll('[data-hooks-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			state[sel.getAttribute('data-hooks-filter')] = sel.value;
			render();
		});
	});
	var search = root.querySelector('[data-hooks-search]');
	if (search) {
		search.addEventListener('input', function () {
			state.q = search.value.trim();
			render();
		});
	}

	render();

})();


/* =======================================================================
   4. Automation Logs  (automation-logs.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-automation-logs]');
	if (!root) return;
	var A = window.CRMS_AUTOMATION;

	var LOGS = [
		{
			id: 'L-9001', source: 'High-value deal follow-up', kind: 'Workflow',
			trigger: 'Deal Stage Changed', record: 'Halcyon Partners - Pilot', recordLink: 'deals-details.html',
			action: 'Send notification', status: 'success', when: '25 Aug 2026, 09:14:02',
			duration: '1.2s', user: 'System', error: '',
			steps: [
				['Trigger', 'Deal stage changed to Negotiation', 'success'],
				['Condition', 'Deal value > $100,000 - matched', 'success'],
				['Action', 'Send notification to Sales Leadership', 'success'],
				['Action', 'Create task "Review high-value deal"', 'success'],
				['Completed', 'Workflow finished in 1.2s', 'success']
			]
		},
		{
			id: 'L-9002', source: 'Automatically assign new leads', kind: 'Rule',
			trigger: 'Lead Created', record: 'Marcus Whitfield', recordLink: 'leads-details.html',
			action: 'Assign user', status: 'success', when: '25 Aug 2026, 09:02:41',
			duration: '0.6s', user: 'System', error: '',
			steps: [
				['Trigger', 'Lead created from Webinar', 'success'],
				['Condition', 'Region is North America - matched', 'success'],
				['Action', 'Assigned to Adrian Herrera (round robin)', 'success'],
				['Completed', 'Rule finished in 0.6s', 'success']
			]
		},
		{
			id: 'L-9003', source: 'Notify finance when invoice overdue', kind: 'Rule',
			trigger: 'Invoice Overdue', record: 'INV-2048', recordLink: 'invoice-details.html',
			action: 'Send notification', status: 'failed', when: '25 Aug 2026, 08:30:11',
			duration: '5.0s', user: 'System',
			error: 'Webhook endpoint https://ledger.internal/v1/invoices returned 502 Bad Gateway after 3 retries.',
			steps: [
				['Trigger', 'Invoice INV-2048 passed its due date', 'success'],
				['Condition', 'Amount > $5,000 - matched', 'success'],
				['Action', 'Notification sent to Finance', 'success'],
				['Failed action', 'Webhook "Invoice created - accounting" returned 502', 'failed'],
				['Error', 'Execution halted after 3 retries', 'failed']
			]
		},
		{
			id: 'L-9004', source: 'New Customer Onboarding', kind: 'Workflow',
			trigger: 'Deal Won', record: 'Arclight Media - Upsell', recordLink: 'deals-details.html',
			action: 'Create task', status: 'running', when: '25 Aug 2026, 08:12:55',
			duration: '—', user: 'System', error: '',
			steps: [
				['Trigger', 'Deal marked closed-won', 'success'],
				['Action', 'Assigned to Customer Success', 'success'],
				['Delay', 'Waiting 2 days before the next step', 'running']
			]
		},
		{
			id: 'L-9005', source: 'Create task when lead qualified', kind: 'Rule',
			trigger: 'Lead Qualified', record: 'Priya Raghunathan', recordLink: 'leads-details.html',
			action: 'Create task', status: 'skipped', when: '24 Aug 2026, 17:44:09',
			duration: '0.2s', user: 'System',
			error: '',
			steps: [
				['Trigger', 'Lead marked qualified', 'success'],
				['Condition', 'Lead score >= 75 - not matched (score 71)', 'skipped'],
				['Skipped', 'No actions were executed', 'skipped']
			]
		},
		{
			id: 'L-9006', source: 'Contract renewal reminder', kind: 'Workflow',
			trigger: 'Contract Expiring', record: 'CNT-0091', recordLink: 'contracts.html',
			action: 'Send email', status: 'success', when: '24 Aug 2026, 07:00:00',
			duration: '0.9s', user: 'System', error: '',
			steps: [
				['Trigger', 'Contract expiring in 30 days', 'success'],
				['Condition', 'Renewal within 30 days - matched', 'success'],
				['Action', 'Email sent to Ellis Vandermeer', 'success'],
				['Action', 'Follow-up created', 'success'],
				['Completed', 'Workflow finished in 0.9s', 'success']
			]
		},
		{
			id: 'L-9007', source: 'Notify team when a deal is won', kind: 'Rule',
			trigger: 'Deal Won', record: 'Northwind Logistics - Renewal', recordLink: 'deals-details.html',
			action: 'Send webhook', status: 'success', when: '24 Aug 2026, 16:58:31',
			duration: '1.4s', user: 'Adrian Herrera', error: '',
			steps: [
				['Trigger', 'Deal marked closed-won', 'success'],
				['Action', 'Team notification sent', 'success'],
				['Action', 'Webhook "Deal won - billing sync" returned 200', 'success'],
				['Completed', 'Rule finished in 1.4s', 'success']
			]
		},
		{
			id: 'L-9008', source: 'Proposal Follow-up', kind: 'Workflow',
			trigger: 'Proposal Created', record: 'PRP-0342', recordLink: 'proposals.html',
			action: 'Send email', status: 'failed', when: '23 Aug 2026, 11:05:47',
			duration: '2.1s', user: 'System',
			error: 'Email template "Proposal follow-up" references {{renewal_date}}, which is empty on this record.',
			steps: [
				['Trigger', 'Proposal PRP-0342 created', 'success'],
				['Delay', 'Waited 3 business days', 'success'],
				['Condition', 'Status is not Accepted - matched', 'success'],
				['Failed action', 'Send email - unresolved merge variable', 'failed'],
				['Error', 'Execution halted', 'failed']
			]
		}
	];

	var STATUS = {
		success: { label: 'Success', tone: 'success', icon: 'ti-circle-check' },
		failed: { label: 'Failed', tone: 'danger', icon: 'ti-alert-circle' },
		running: { label: 'Running', tone: 'warning', icon: 'ti-loader' },
		skipped: { label: 'Skipped', tone: 'secondary', icon: 'ti-player-skip-forward' }
	};

	var state = { q: '', status: 'all', kind: 'all', trigger: 'all', user: 'all' };

	var body = root.querySelector('[data-logs-body]');
	var empty = root.querySelector('[data-logs-empty]');
	var countEl = root.querySelector('[data-logs-count]');

	function row(l) {
		var st = STATUS[l.status];
		return '<tr>' +
			'<td><button type="button" class="fw-medium text-dark bg-transparent border-0 p-0 text-start" ' +
			'data-log-open="' + l.id + '">' + A.esc(l.source) + '</button>' +
			'<span class="fs-12 text-muted d-block">' + l.id + ' · ' + l.kind + '</span></td>' +
			'<td>' + l.trigger + '</td>' +
			'<td><a href="' + l.recordLink + '" class="link-primary">' + A.esc(l.record) + '</a></td>' +
			'<td>' + l.action + '</td>' +
			'<td>' + A.badge('<i class="ti ' + st.icon + ' me-1"></i>' + st.label, st.tone) + '</td>' +
			'<td>' + l.when + '</td>' +
			'<td>' + l.duration + '</td>' +
			'<td>' + l.user + '</td>' +
			'<td>' + (l.error
				? '<span class="fs-12 text-danger text-truncate d-inline-block" style="max-width:220px;" ' +
				'title="' + A.esc(l.error) + '">' + A.esc(l.error) + '</span>'
				: '<span class="fs-12 text-muted">—</span>') + '</td>' +
			'<td class="no-sort"><button type="button" class="btn btn-sm btn-outline-light shadow" ' +
			'data-log-open="' + l.id + '"><i class="ti ti-eye me-1"></i>Details</button></td>' +
			'</tr>';
	}

	function visible(l) {
		if (state.status !== 'all' && l.status !== state.status) return false;
		if (state.kind !== 'all' && l.kind !== state.kind) return false;
		if (state.trigger !== 'all' && l.trigger !== state.trigger) return false;
		if (state.user !== 'all' && l.user !== state.user) return false;
		if (state.q) {
			var hay = (l.source + ' ' + l.record + ' ' + l.trigger + ' ' + l.action).toLowerCase();
			if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
		}
		return true;
	}

	function render() {
		var rows = LOGS.filter(visible);
		body.innerHTML = rows.map(row).join('');
		if (countEl) countEl.textContent = rows.length + ' of ' + LOGS.length + ' executions';
		if (empty) empty.classList.toggle('d-none', rows.length > 0);

		var counts = { success: 0, failed: 0, running: 0, skipped: 0 };
		LOGS.forEach(function (l) { counts[l.status]++; });
		Object.keys(counts).forEach(function (k) {
			var el = root.querySelector('[data-logs-stat="' + k + '"]');
			if (el) el.textContent = counts[k];
		});
	}

	function find(id) {
		return LOGS.filter(function (l) { return l.id === id; })[0];
	}

	root.addEventListener('click', function (e) {
		var t = e.target.closest('[data-log-open]');
		if (t) openLog(find(t.getAttribute('data-log-open')));
	});

	// ---- execution detail modal --------------------------------------------
	function openLog(l) {
		var el = document.getElementById('log_modal');
		if (!el || !l) return;
		var st = STATUS[l.status];

		el.querySelector('[data-ld-name]').textContent = l.source;
		el.querySelector('[data-ld-meta]').textContent = l.id + ' · ' + l.kind + ' · ' + l.when;
		el.querySelector('[data-ld-status]').innerHTML =
			A.badge('<i class="ti ' + st.icon + ' me-1"></i>' + st.label, st.tone);
		el.querySelector('[data-ld-trigger]').textContent = l.trigger;
		el.querySelector('[data-ld-record]').innerHTML =
			'<a href="' + l.recordLink + '" class="link-primary">' + A.esc(l.record) + '</a>';
		el.querySelector('[data-ld-duration]').textContent = l.duration;
		el.querySelector('[data-ld-user]').textContent = l.user;

		var ok = l.steps.filter(function (s) { return s[2] === 'success'; }).length;
		var bad = l.steps.filter(function (s) { return s[2] === 'failed'; }).length;
		el.querySelector('[data-ld-ok]').textContent = ok;
		el.querySelector('[data-ld-bad]').textContent = bad;

		// horizontal execution path
		el.querySelector('[data-ld-path]').innerHTML = l.steps.map(function (s, i) {
			var tone = { success: 'success', failed: 'danger', running: 'warning', skipped: 'secondary' }[s[2]];
			return (i ? '<span class="log-path-arrow"><i class="ti ti-chevron-right"></i></span>' : '') +
				'<span class="log-path-step is-' + s[2] + '">' + A.esc(s[0]) + '</span>';
		}).join('');

		// vertical timeline with detail
		el.querySelector('[data-ld-timeline]').innerHTML = l.steps.map(function (s) {
			var tone = { success: 'success', failed: 'danger', running: 'warning', skipped: 'primary' }[s[2]];
			return '<li class="is-' + tone + '">' +
				'<span class="ai-timeline-time">' + A.esc(s[0]) + '</span>' +
				'<p class="ai-timeline-text mb-0">' + A.esc(s[1]) + '</p></li>';
		}).join('');

		var errBox = el.querySelector('[data-ld-error]');
		if (l.error) {
			errBox.innerHTML = '<div class="alert alert-danger py-2 px-3 fs-13 mb-0">' +
				'<i class="ti ti-alert-circle me-1"></i>' + A.esc(l.error) + '</div>';
			errBox.classList.remove('d-none');
		} else {
			errBox.classList.add('d-none');
		}

		A.modal('log_modal').show();
	}

	// ---- filters -------------------------------------------------------------
	document.querySelectorAll('[data-logs-filter]').forEach(function (sel) {
		sel.addEventListener('change', function () {
			state[sel.getAttribute('data-logs-filter')] = sel.value;
			render();
		});
	});
	var search = root.querySelector('[data-logs-search]');
	if (search) {
		search.addEventListener('input', function () {
			state.q = search.value.trim();
			render();
		});
	}
	document.querySelectorAll('[data-logs-reset]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			state = { q: '', status: 'all', kind: 'all', trigger: 'all', user: 'all' };
			document.querySelectorAll('[data-logs-filter]').forEach(function (s) { s.value = 'all'; });
			if (search) search.value = '';
			render();
			A.notify('Filters cleared.', 'warning');
		});
	});

	render();

})();
