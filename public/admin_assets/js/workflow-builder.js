/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
Description  : Automation workflow builder - node canvas, palette and properties panel.
*/
(function () {
	"use strict";

	var root = document.querySelector('.workflow-builder');
	if (!root) return;

	var canvas = root.querySelector('[data-workflow-flow]');
	var propsPanel = root.querySelector('[data-workflow-props]');
	if (!canvas) return;

	// -----------------------------------------------------------------
	// Block catalogue. `kind` drives the node colour rail and icon tint;
	// `group` drives which palette section the block appears under.
	// -----------------------------------------------------------------
	var BLOCKS = {
		// --- triggers : leads -----------------------------------------
		'lead-created': { kind: 'trigger', group: 'Leads', icon: 'ti-user-plus', title: 'Lead created', desc: 'Runs when a new lead enters the CRM.' },
		'lead-updated': { kind: 'trigger', group: 'Leads', icon: 'ti-user-edit', title: 'Lead updated', desc: 'Runs when any field on a lead changes.' },
		'lead-status-changed': { kind: 'trigger', group: 'Leads', icon: 'ti-status-change', title: 'Lead status changed', desc: 'Runs when a lead moves between statuses.' },
		'lead-assigned': { kind: 'trigger', group: 'Leads', icon: 'ti-user-check', title: 'Lead assigned', desc: 'Runs when a lead is assigned to an owner.' },
		'lead-qualified': { kind: 'trigger', group: 'Leads', icon: 'ti-user-star', title: 'Lead qualified', desc: 'Runs when a lead is marked qualified.' },
		'lead-score-changed': { kind: 'trigger', group: 'Leads', icon: 'ti-target-arrow', title: 'Lead score changed', desc: 'Runs when the AI lead score is recalculated.' },

		// --- triggers : contacts & companies --------------------------
		'contact-created': { kind: 'trigger', group: 'Contacts & Companies', icon: 'ti-users-plus', title: 'Contact created', desc: 'Runs when a new contact is added.' },
		'contact-updated': { kind: 'trigger', group: 'Contacts & Companies', icon: 'ti-user-edit', title: 'Contact updated', desc: 'Runs when a contact record changes.' },
		'company-created': { kind: 'trigger', group: 'Contacts & Companies', icon: 'ti-building-plus', title: 'Company created', desc: 'Runs when a new company is added.' },
		'company-updated': { kind: 'trigger', group: 'Contacts & Companies', icon: 'ti-building', title: 'Company updated', desc: 'Runs when a company record changes.' },
		'owner-changed': { kind: 'trigger', group: 'Contacts & Companies', icon: 'ti-user-share', title: 'Account owner changed', desc: 'Runs when an account changes owner.' },

		// --- triggers : deals -----------------------------------------
		'deal-created': { kind: 'trigger', group: 'Deals', icon: 'ti-briefcase', title: 'Deal created', desc: 'Runs when a new deal is opened.' },
		'deal-stage-changed': { kind: 'trigger', group: 'Deals', icon: 'ti-git-branch', title: 'Deal stage changed', desc: 'Runs when a deal moves between pipeline stages.' },
		'deal-value-changed': { kind: 'trigger', group: 'Deals', icon: 'ti-coin', title: 'Deal value changed', desc: 'Runs when the deal amount is edited.' },
		'deal-won': { kind: 'trigger', group: 'Deals', icon: 'ti-trophy', title: 'Deal won', desc: 'Runs when a deal is marked closed-won.' },
		'deal-lost': { kind: 'trigger', group: 'Deals', icon: 'ti-thumb-down', title: 'Deal lost', desc: 'Runs when a deal is marked closed-lost.' },

		// --- triggers : activities ------------------------------------
		'activity-created': { kind: 'trigger', group: 'Activities', icon: 'ti-bolt', title: 'Activity created', desc: 'Runs when any activity is logged.' },
		'task-completed': { kind: 'trigger', group: 'Activities', icon: 'ti-checkbox', title: 'Task completed', desc: 'Runs when a task is marked complete.' },
		'task-overdue': { kind: 'trigger', group: 'Activities', icon: 'ti-clock-exclamation', title: 'Task overdue', desc: 'Runs when a task passes its due date.' },
		'followup-due': { kind: 'trigger', group: 'Activities', icon: 'ti-bell-ringing', title: 'Follow-up due', desc: 'Runs when a scheduled follow-up comes due.' },
		'meeting-scheduled': { kind: 'trigger', group: 'Activities', icon: 'ti-calendar-event', title: 'Meeting scheduled', desc: 'Runs when a meeting is booked.' },

		// --- triggers : documents & contracts --------------------------
		'proposal-created': { kind: 'trigger', group: 'Documents & Contracts', icon: 'ti-file-text', title: 'Proposal created', desc: 'Runs when a proposal is generated.' },
		'proposal-accepted': { kind: 'trigger', group: 'Documents & Contracts', icon: 'ti-file-check', title: 'Proposal accepted', desc: 'Runs when a customer accepts a proposal.' },
		'contract-created': { kind: 'trigger', group: 'Documents & Contracts', icon: 'ti-file-certificate', title: 'Contract created', desc: 'Runs when a contract is drafted.' },
		'contract-expiring': { kind: 'trigger', group: 'Documents & Contracts', icon: 'ti-calendar-x', title: 'Contract expiring', desc: 'Runs ahead of a contract renewal date.' },

		// --- triggers : finance ---------------------------------------
		'invoice-created': { kind: 'trigger', group: 'Finance', icon: 'ti-receipt', title: 'Invoice created', desc: 'Runs when an invoice is issued.' },
		'invoice-overdue': { kind: 'trigger', group: 'Finance', icon: 'ti-receipt-off', title: 'Invoice overdue', desc: 'Runs when an invoice passes its due date.' },
		'payment-received': { kind: 'trigger', group: 'Finance', icon: 'ti-credit-card', title: 'Payment received', desc: 'Runs when a payment clears.' },

		// --- conditions ------------------------------------------------
		'field-check': { kind: 'condition', group: 'Conditions', icon: 'ti-filter', title: 'Field condition', desc: 'Continue only when the field matches.' },
		'if-else': { kind: 'condition', group: 'Conditions', icon: 'ti-arrows-split-2', title: 'If / else branch', desc: 'Split the flow into a yes and a no path.', branches: true },
		'score-check': { kind: 'condition', group: 'Conditions', icon: 'ti-target-arrow', title: 'Score threshold', desc: 'Continue when the score crosses a value.' },
		'amount-check': { kind: 'condition', group: 'Conditions', icon: 'ti-coin', title: 'Amount threshold', desc: 'Continue when the amount crosses a value.' },
		'date-check': { kind: 'condition', group: 'Conditions', icon: 'ti-calendar-stats', title: 'Date condition', desc: 'Continue based on a date field.' },
		'status-check': { kind: 'condition', group: 'Conditions', icon: 'ti-status-change', title: 'Status condition', desc: 'Continue when the record has a status.' },
		'multi-check': { kind: 'condition', group: 'Conditions', icon: 'ti-layers-intersect', title: 'Multiple conditions', desc: 'Combine several rules with AND / OR.' },

		// --- actions ----------------------------------------------------
		'send-email': { kind: 'action', group: 'Actions', icon: 'ti-mail', title: 'Send email', desc: 'Send a templated email to the record owner or contact.' },
		'create-task': { kind: 'action', group: 'Actions', icon: 'ti-checklist', title: 'Create task', desc: 'Create a follow-up task and assign an owner.' },
		'assign-user': { kind: 'action', group: 'Actions', icon: 'ti-user-check', title: 'Assign user', desc: 'Route the record to a specific user.' },
		'assign-team': { kind: 'action', group: 'Actions', icon: 'ti-users-group', title: 'Assign team', desc: 'Route the record to a team queue.' },
		'update-field': { kind: 'action', group: 'Actions', icon: 'ti-edit', title: 'Update record', desc: 'Write a value to a field on the record.' },
		'add-tag': { kind: 'action', group: 'Actions', icon: 'ti-tag', title: 'Add tag', desc: 'Apply a tag to the record.' },
		'remove-tag': { kind: 'action', group: 'Actions', icon: 'ti-tag-off', title: 'Remove tag', desc: 'Strip a tag from the record.' },
		'create-activity': { kind: 'action', group: 'Actions', icon: 'ti-bolt', title: 'Create activity', desc: 'Log an activity against the record.' },
		'create-followup': { kind: 'action', group: 'Actions', icon: 'ti-bell-plus', title: 'Create follow-up', desc: 'Schedule a follow-up on the record.' },
		'notify-slack': { kind: 'action', group: 'Actions', icon: 'ti-bell', title: 'Send notification', desc: 'Notify a user or channel in-app.' },
		'add-sequence': { kind: 'action', group: 'Actions', icon: 'ti-mail-fast', title: 'Add to sales sequence', desc: 'Enrol the contact in an existing sequence.' },
		'create-deal': { kind: 'action', group: 'Actions', icon: 'ti-briefcase', title: 'Create deal', desc: 'Open a new deal from this record.' },
		'send-webhook': { kind: 'action', group: 'Actions', icon: 'ti-webhook', title: 'Create webhook', desc: 'POST the record payload to an external URL.' },

		// --- timing ------------------------------------------------------
		'wait-delay': { kind: 'delay', group: 'Timing', icon: 'ti-clock-hour-4', title: 'Wait', desc: 'Pause the flow for a fixed duration.' }
	};

	// Palette sections, in display order.
	var PALETTE = [
		{ label: 'Triggers - Leads', match: function (b) { return b.group === 'Leads'; } },
		{ label: 'Triggers - Contacts & Companies', match: function (b) { return b.group === 'Contacts & Companies'; } },
		{ label: 'Triggers - Deals', match: function (b) { return b.group === 'Deals'; } },
		{ label: 'Triggers - Activities', match: function (b) { return b.group === 'Activities'; } },
		{ label: 'Triggers - Documents & Contracts', match: function (b) { return b.group === 'Documents & Contracts'; } },
		{ label: 'Triggers - Finance', match: function (b) { return b.group === 'Finance'; } },
		{ label: 'Conditions', match: function (b) { return b.group === 'Conditions'; } },
		{ label: 'Actions', match: function (b) { return b.group === 'Actions'; } },
		{ label: 'Timing', match: function (b) { return b.group === 'Timing'; } }
	];

	var KIND_TINT = {
		trigger: 'bg-soft-primary text-primary',
		condition: 'bg-soft-warning text-warning',
		action: 'bg-soft-success text-success',
		delay: 'bg-purple-subtle text-purple'
	};

	// The flow as authored. Index order == visual order.
	var flow = [
		{ id: 'n1', type: 'deal-stage-changed' },
		{ id: 'n2', type: 'score-check' },
		{ id: 'n3', type: 'send-email' },
		{ id: 'n4', type: 'wait-delay' },
		{ id: 'n5', type: 'create-task' }
	];

	var selectedId = null;
	var seq = flow.length;
	var issues = {};          // nodeId -> validation message
	var structuralIssue = ''; // workflow-level problem

	function nextId() {
		seq += 1;
		return 'n' + seq;
	}

	// -----------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------
	function nodeMarkup(node, index) {
		var block = BLOCKS[node.type];
		if (!block) return '';
		var tint = KIND_TINT[block.kind] || 'bg-light text-dark';
		var problem = issues[node.id];

		return '<div class="workflow-node' + (node.id === selectedId ? ' is-selected' : '') +
			(problem ? ' is-invalid' : '') + '"' +
			' data-node-id="' + node.id + '" data-kind="' + block.kind + '"' +
			' tabindex="0" role="button" aria-pressed="' + (node.id === selectedId) + '">' +

			// step tools - reorder, duplicate, remove
			'<div class="workflow-node-tools">' +
			'<button type="button" class="workflow-node-tool" data-node-up="' + node.id + '"' +
			(index === 0 ? ' disabled' : '') + ' aria-label="Move step up"><i class="ti ti-chevron-up"></i></button>' +
			'<button type="button" class="workflow-node-tool" data-node-down="' + node.id + '"' +
			(index === flow.length - 1 ? ' disabled' : '') + ' aria-label="Move step down"><i class="ti ti-chevron-down"></i></button>' +
			'<button type="button" class="workflow-node-tool" data-node-copy="' + node.id + '"' +
			' aria-label="Duplicate step"><i class="ti ti-copy"></i></button>' +
			'<button type="button" class="workflow-node-tool workflow-node-remove" data-node-remove="' + node.id + '"' +
			' aria-label="Remove ' + block.title + ' step"><i class="ti ti-x"></i></button>' +
			'</div>' +

			'<div class="workflow-node-head">' +
			'<span class="workflow-node-icon ' + tint + '"><i class="ti ' + block.icon + '"></i></span>' +
			'<div>' +
			'<span class="workflow-node-kind">' + (index === 0 ? 'Trigger' : block.kind) + '</span>' +
			'<h6 class="workflow-node-title">' + (node.title || block.title) + '</h6>' +
			'</div>' +
			'</div>' +
			'<p class="workflow-node-desc">' + (node.desc || block.desc) + '</p>' +
			(problem
				? '<p class="workflow-node-issue"><i class="ti ti-alert-triangle me-1"></i>' + problem + '</p>'
				: '') +
			'</div>';
	}

	// A condition block with branches renders a yes / no split beneath it,
	// reusing the .workflow-branch styles already in the stylesheet.
	function branchMarkup(node) {
		var yes = (node.yesLabel || 'Continue the workflow');
		var no = (node.noLabel || 'Stop - nothing happens');
		return '<div class="workflow-branch">' +
			'<div class="workflow-branch-col workflow-branch-col--yes">' +
			'<span class="workflow-branch-label"><i class="ti ti-check"></i>Yes</span>' +
			'<div class="workflow-node" data-branch-of="' + node.id + '" data-kind="action">' +
			'<div class="workflow-node-head">' +
			'<span class="workflow-node-icon bg-soft-success text-success"><i class="ti ti-arrow-down"></i></span>' +
			'<div><span class="workflow-node-kind">Success path</span>' +
			'<h6 class="workflow-node-title">' + yes + '</h6></div></div></div>' +
			'</div>' +
			'<div class="workflow-branch-col workflow-branch-col--no">' +
			'<span class="workflow-branch-label"><i class="ti ti-x"></i>No</span>' +
			'<div class="workflow-node" data-branch-of="' + node.id + '" data-kind="condition">' +
			'<div class="workflow-node-head">' +
			'<span class="workflow-node-icon bg-soft-danger text-danger"><i class="ti ti-player-stop"></i></span>' +
			'<div><span class="workflow-node-kind">Failure path</span>' +
			'<h6 class="workflow-node-title">' + no + '</h6></div></div></div>' +
			'</div>' +
			'</div>';
	}

	function connectorMarkup(afterIndex) {
		return '<div class="workflow-connector">' +
			'<button type="button" class="workflow-add" data-node-insert="' + afterIndex + '"' +
			' aria-label="Insert a step here"><i class="ti ti-plus"></i></button>' +
			'</div>';
	}

	function render() {
		if (!flow.length) {
			canvas.innerHTML = '<div class="workflow-canvas-hint">' +
				'<i class="ti ti-hierarchy-2 d-block mb-2"></i>' +
				'Add a trigger from the left to start building this workflow.' +
				'</div>';
			issues = {};
			renderProps();
			renderValidation();
			updateStepCount();
			return;
		}

		validate();

		var html = '';
		flow.forEach(function (node, i) {
			html += nodeMarkup(node, i);
			var block = BLOCKS[node.type];
			// a branching condition draws its yes / no paths before the
			// flow continues underneath
			if (block && block.branches) {
				html += '<div class="workflow-connector"></div>';
				html += branchMarkup(node);
			}
			html += connectorMarkup(i);
		});
		html += '<span class="workflow-end"><i class="ti ti-flag-check"></i> End of workflow</span>';
		canvas.innerHTML = html;

		bindNodeEvents();
		renderProps();
		renderValidation();
		updateStepCount();
	}

	function bindNodeEvents() {
		canvas.querySelectorAll('.workflow-node[data-node-id]').forEach(function (el) {
			el.addEventListener('click', function (e) {
				if (e.target.closest('.workflow-node-tool')) return;
				selectNode(el.getAttribute('data-node-id'));
			});
			el.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					selectNode(el.getAttribute('data-node-id'));
				}
			});
		});

		canvas.querySelectorAll('[data-node-remove]').forEach(function (btn) {
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				removeNode(btn.getAttribute('data-node-remove'));
			});
		});

		canvas.querySelectorAll('[data-node-copy]').forEach(function (btn) {
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				duplicateNode(btn.getAttribute('data-node-copy'));
			});
		});

		canvas.querySelectorAll('[data-node-up]').forEach(function (btn) {
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				moveNode(btn.getAttribute('data-node-up'), -1);
			});
		});

		canvas.querySelectorAll('[data-node-down]').forEach(function (btn) {
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				moveNode(btn.getAttribute('data-node-down'), 1);
			});
		});

		canvas.querySelectorAll('[data-node-insert]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				pendingInsertAt = parseInt(btn.getAttribute('data-node-insert'), 10) + 1;
				openBlockPicker();
			});
		});
	}

	// ---- step operations ---------------------------------------------
	function indexOfNode(id) {
		for (var i = 0; i < flow.length; i++) {
			if (flow[i].id === id) return i;
		}
		return -1;
	}

	function duplicateNode(id) {
		var at = indexOfNode(id);
		if (at < 0) return;
		var src = flow[at];
		var copy = {
			id: nextId(),
			type: src.type,
			title: (src.title || BLOCKS[src.type].title) + ' (copy)',
			desc: src.desc,
			yesLabel: src.yesLabel,
			noLabel: src.noLabel,
			cfg: JSON.parse(JSON.stringify(src.cfg || {}))
		};
		flow.splice(at + 1, 0, copy);
		selectedId = copy.id;
		render();
		toast('Step duplicated.');
	}

	function moveNode(id, delta) {
		var at = indexOfNode(id);
		var to = at + delta;
		if (at < 0 || to < 0 || to >= flow.length) return;
		var moved = flow.splice(at, 1)[0];
		flow.splice(to, 0, moved);
		selectedId = moved.id;
		render();
	}

	function selectNode(id) {
		selectedId = id;
		canvas.querySelectorAll('.workflow-node').forEach(function (el) {
			var on = el.getAttribute('data-node-id') === id;
			el.classList.toggle('is-selected', on);
			el.setAttribute('aria-pressed', on);
		});
		renderProps();
	}

	function removeNode(id) {
		flow = flow.filter(function (n) { return n.id !== id; });
		if (selectedId === id) selectedId = null;
		render();
	}

	// -----------------------------------------------------------------
	// Properties panel - reflects whichever node is selected
	// -----------------------------------------------------------------
	function renderProps() {
		if (!propsPanel) return;

		var node = flow.filter(function (n) { return n.id === selectedId; })[0];
		if (!node) {
			propsPanel.innerHTML = '<div class="workflow-props-empty">' +
				'<i class="ti ti-click d-block mb-2"></i>' +
				'<p class="mb-0 fs-13">Select a step on the canvas to edit its settings.</p>' +
				'</div>';
			return;
		}

		var block = BLOCKS[node.type];
		node.cfg = node.cfg || {};

		var html = '<div class="d-flex align-items-center gap-2 mb-3">' +
			'<span class="workflow-node-icon ' + (KIND_TINT[block.kind] || '') + '">' +
			'<i class="ti ' + block.icon + '"></i></span>' +
			'<div class="min-w-0"><span class="workflow-node-kind">' + block.kind + '</span>' +
			'<h6 class="mb-0 fs-14 text-truncate">' + block.title + '</h6></div></div>';

		if (issues[node.id]) {
			html += '<div class="alert alert-warning py-2 px-3 fs-12 mb-3">' +
				'<i class="ti ti-alert-triangle me-1"></i>' + issues[node.id] + '</div>';
		}

		html += field('Step name', '<input type="text" class="form-control" data-prop="title" value="' +
			esc(node.title || block.title) + '">') +
			field('Description', '<textarea class="form-control" rows="2" data-prop="desc">' +
				esc(node.desc || block.desc) + '</textarea>');

		html += settingsFor(node, block);

		html += '<div class="form-check form-switch mb-3">' +
			'<input class="form-check-input" type="checkbox" id="wf_prop_skip"' +
			(node.cfg.skipWeekends ? ' checked' : '') + ' data-cfg="skipWeekends">' +
			'<label class="form-check-label fs-13" for="wf_prop_skip">Skip this step on weekends</label>' +
			'</div>';

		html += '<div class="d-flex gap-2">' +
			'<button type="button" class="btn btn-sm btn-outline-light shadow flex-grow-1" ' +
			'data-node-copy="' + node.id + '"><i class="ti ti-copy me-1"></i>Duplicate</button>' +
			'<button type="button" class="btn btn-sm btn-outline-light shadow text-danger flex-grow-1" ' +
			'data-node-remove="' + node.id + '"><i class="ti ti-trash me-1"></i>Delete</button></div>';

		propsPanel.innerHTML = html;
		bindProps(node);
	}

	function esc(str) {
		return String(str == null ? '' : str)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;')
			.replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function field(label, control, hint) {
		return '<div class="mb-3"><label class="form-label">' + label + '</label>' + control +
			(hint ? '<span class="fs-12 text-muted">' + hint + '</span>' : '') + '</div>';
	}

	function sel(key, options, current) {
		return '<select class="form-select" data-cfg="' + key + '">' +
			options.map(function (o) {
				return '<option' + (o === current ? ' selected' : '') + '>' + o + '</option>';
			}).join('') + '</select>';
	}

	function txt(key, current, placeholder) {
		return '<input type="text" class="form-control" data-cfg="' + key + '" value="' +
			esc(current) + '" placeholder="' + (placeholder || '') + '">';
	}

	var USERS = ['Record owner', 'Adrian Herrera', 'Ellis Vandermeer', 'Priya Raghunathan',
		'Tomas Lindqvist', 'Nadia Okonkwo'];
	var TEAMS = ['Enterprise', 'Mid-Market', 'SMB', 'Customer Success', 'Finance'];
	var FIELDS = ['Lead score', 'Lead status', 'Deal value', 'Deal stage', 'Probability',
		'Owner', 'Source', 'Industry', 'Region', 'Close date'];
	var OPS = ['equals', 'does not equal', 'is greater than', 'is less than',
		'contains', 'is empty', 'is not empty'];

	// The configuration panel differs per block - this is what makes the
	// builder feel like a real automation tool rather than a mock.
	function settingsFor(node, block) {
		var c = node.cfg;
		var t = node.type;

		if (t === 'send-email') {
			return field('Email template', sel('template', ['Follow-up - high intent',
				'Welcome sequence - step 1', 'Proposal follow-up', 'Renewal reminder',
				'Re-engagement', 'Custom message'], c.template)) +
				field('Recipient', sel('recipient', ['Primary contact', 'Record owner',
					'Account owner', 'Sales manager', 'Custom address'], c.recipient)) +
				field('Subject', txt('subject', c.subject || 'Following up on {{deal_name}}')) +
				field('Message', '<textarea class="form-control" rows="3" data-cfg="message">' +
					esc(c.message || 'Hi {{first_name}},\n\nJust following up on our conversation.') +
					'</textarea>') +
				'<div class="row g-2 mb-3">' +
				'<div class="col-6"><label class="form-label">CC</label>' + txt('cc', c.cc, 'cc@company.com') + '</div>' +
				'<div class="col-6"><label class="form-label">BCC</label>' + txt('bcc', c.bcc, 'bcc@company.com') + '</div>' +
				'</div>' +
				'<div class="mb-3"><label class="form-label">Variables</label>' +
				'<div class="d-flex flex-wrap gap-1">' +
				['{{first_name}}', '{{company}}', '{{deal_name}}', '{{deal_value}}', '{{owner}}']
					.map(function (v) {
						return '<button type="button" class="ai-suggestion" data-wf-var="' + v + '">' + v + '</button>';
					}).join('') + '</div></div>';
		}

		if (t === 'create-task' || t === 'create-followup' || t === 'create-activity') {
			return field('Task title', txt('taskTitle', c.taskTitle || 'Follow up with {{first_name}}')) +
				field('Assigned user', sel('assignee', USERS, c.assignee)) +
				'<div class="row g-2 mb-3">' +
				'<div class="col-6"><label class="form-label">Due in</label>' +
				'<input type="number" class="form-control" data-cfg="dueIn" value="' + (c.dueIn || 2) + '" min="0"></div>' +
				'<div class="col-6"><label class="form-label">Unit</label>' +
				sel('dueUnit', ['Hours', 'Days', 'Weeks'], c.dueUnit || 'Days') + '</div></div>' +
				field('Priority', sel('priority', ['High', 'Medium', 'Low'], c.priority || 'Medium')) +
				field('Description', '<textarea class="form-control" rows="2" data-cfg="taskDesc">' +
					esc(c.taskDesc || '') + '</textarea>');
		}

		if (t === 'assign-user') {
			return field('Assign to', sel('assignee', USERS, c.assignee)) +
				field('Assignment method', sel('method', ['Direct assignment', 'Round robin',
					'Least active owner', 'By territory'], c.method));
		}

		if (t === 'assign-team') {
			return field('Assign to team', sel('team', TEAMS, c.team)) +
				field('Queue behaviour', sel('queue', ['Round robin within team',
					'First to claim', 'Team manager'], c.queue));
		}

		if (t === 'update-field') {
			return field('Field', sel('field', FIELDS, c.field)) +
				field('New value', txt('value', c.value, 'e.g. Qualified'));
		}

		if (t === 'add-tag' || t === 'remove-tag') {
			return field('Tag', sel('tag', ['High Intent', 'Enterprise', 'Nurture',
				'At Risk', 'Champion', 'Do Not Contact'], c.tag));
		}

		if (t === 'notify-slack') {
			return field('Notify', sel('notify', USERS.concat(['Whole team']), c.notify)) +
				field('Channel', sel('channel', ['In-app notification', 'Email', 'Both'], c.channel)) +
				field('Message', '<textarea class="form-control" rows="2" data-cfg="message">' +
					esc(c.message || 'High-value deal {{deal_name}} needs attention.') + '</textarea>');
		}

		if (t === 'add-sequence') {
			return field('Sequence', sel('sequence', ['New lead nurture - 6 touch',
				'Proposal follow-up - 4 touch', 'Renewal outreach', 'Re-engagement'], c.sequence),
				'Sequences are managed in the Sales Engagement module.') +
				field('Enrol as', sel('enrolAs', ['Primary contact', 'All contacts on the account'], c.enrolAs));
		}

		if (t === 'create-deal') {
			return field('Pipeline', sel('pipeline', ['New Business', 'Renewals', 'Expansion'], c.pipeline)) +
				field('Stage', sel('stage', ['Qualification', 'Needs Analysis', 'Proposal Sent'], c.stage)) +
				field('Deal owner', sel('assignee', USERS, c.assignee));
		}

		if (t === 'send-webhook') {
			return field('Webhook', sel('webhook', ['Deal won - billing sync',
				'Lead created - marketing', 'Payment received - finance'], c.webhook),
				'Endpoints are managed on the Webhooks page.') +
				field('Method', sel('method', ['POST', 'PUT', 'PATCH'], c.method || 'POST'));
		}

		if (block.kind === 'delay') {
			return '<div class="row g-2 mb-3">' +
				'<div class="col-6"><label class="form-label">Wait for</label>' +
				'<input type="number" class="form-control" data-cfg="duration" value="' +
				(c.duration || 2) + '" min="1"></div>' +
				'<div class="col-6"><label class="form-label">Unit</label>' +
				sel('unit', ['Minutes', 'Hours', 'Days', 'Weeks'], c.unit || 'Days') + '</div></div>' +
				'<div class="form-check form-switch mb-3">' +
				'<input class="form-check-input" type="checkbox" id="wf_business_days"' +
				(c.businessDays ? ' checked' : '') + ' data-cfg="businessDays">' +
				'<label class="form-check-label fs-13" for="wf_business_days">' +
				'Continue on business days only</label></div>';
		}

		if (block.kind === 'condition') {
			var html = field('Field', sel('field', FIELDS, c.field)) +
				'<div class="row g-2 mb-3">' +
				'<div class="col-7"><label class="form-label">Operator</label>' +
				sel('operator', OPS, c.operator) + '</div>' +
				'<div class="col-5"><label class="form-label">Value</label>' +
				txt('value', c.value, 'e.g. 70') + '</div></div>' +
				field('Combine with', sel('join', ['AND - all must match', 'OR - any may match'], c.join));

			if (block.branches) {
				html += '<div class="row g-2 mb-3">' +
					'<div class="col-6"><label class="form-label">Yes path</label>' +
					txt('yesLabel', node.yesLabel || 'Continue the workflow') + '</div>' +
					'<div class="col-6"><label class="form-label">No path</label>' +
					txt('noLabel', node.noLabel || 'Stop - nothing happens') + '</div></div>';
			}
			return html;
		}

		// triggers
		return field('Applies to', sel('object', ['Leads', 'Contacts', 'Companies', 'Deals',
			'Activities', 'Proposals', 'Contracts', 'Invoices', 'Payments'], c.object)) +
			field('Run for', sel('scope', ['All records', 'Records I own',
				'A specific pipeline', 'A specific team'], c.scope)) +
			field('Re-run behaviour', sel('rerun', ['Run once per record',
				'Run every time the trigger fires'], c.rerun));
	}

	function bindProps(node) {
		propsPanel.querySelectorAll('[data-prop]').forEach(function (input) {
			input.addEventListener('input', function () {
				node[input.getAttribute('data-prop')] = input.value;
				var el = canvas.querySelector('[data-node-id="' + node.id + '"]');
				if (!el) return;
				if (input.getAttribute('data-prop') === 'title') {
					el.querySelector('.workflow-node-title').textContent = input.value;
				} else {
					el.querySelector('.workflow-node-desc').textContent = input.value;
				}
			});
		});

		propsPanel.querySelectorAll('[data-cfg]').forEach(function (input) {
			var key = input.getAttribute('data-cfg');
			var evt = input.type === 'checkbox' ? 'change' : 'input';
			input.addEventListener(evt, function () {
				node.cfg[key] = input.type === 'checkbox' ? input.checked : input.value;
				if (key === 'yesLabel') node.yesLabel = input.value;
				if (key === 'noLabel') node.noLabel = input.value;
				validate();
				render();
				selectNode(node.id);
			});
		});

		// insert a merge variable into the message body
		propsPanel.querySelectorAll('[data-wf-var]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var box = propsPanel.querySelector('[data-cfg="message"]');
				if (!box) return;
				box.value += ' ' + btn.getAttribute('data-wf-var');
				node.cfg.message = box.value;
			});
		});
	}

	// -----------------------------------------------------------------
	// Adding blocks - palette click, drag-drop, and the picker modal
	// -----------------------------------------------------------------
	var pendingInsertAt = null;

	function addBlock(type, at) {
		if (!BLOCKS[type]) return;
		var node = { id: nextId(), type: type };
		if (typeof at === 'number' && at >= 0 && at <= flow.length) {
			flow.splice(at, 0, node);
		} else {
			flow.push(node);
		}
		selectedId = node.id;
		render();
	}

	var canvasWrap = root.querySelector('.workflow-canvas');
	if (canvasWrap) {
		canvasWrap.addEventListener('dragover', function (e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			canvasWrap.classList.add('is-dragover');
		});
		canvasWrap.addEventListener('dragleave', function () {
			canvasWrap.classList.remove('is-dragover');
		});
		canvasWrap.addEventListener('drop', function (e) {
			e.preventDefault();
			canvasWrap.classList.remove('is-dragover');
			var type = e.dataTransfer.getData('text/plain');
			if (type) addBlock(type, null);
		});
	}

	// modal used by the inline "+" connectors
	var pickerEl = document.getElementById('add_step_modal');
	function openBlockPicker() {
		if (!pickerEl || !window.bootstrap) return;
		window.bootstrap.Modal.getOrCreateInstance(pickerEl).show();
	}
	if (pickerEl) {
		pickerEl.querySelectorAll('[data-block-pick]').forEach(function (el) {
			el.addEventListener('click', function () {
				addBlock(el.getAttribute('data-block-pick'), pendingInsertAt);
				pendingInsertAt = null;
				window.bootstrap.Modal.getOrCreateInstance(pickerEl).hide();
			});
		});
		pickerEl.addEventListener('hidden.bs.modal', function () {
			pendingInsertAt = null;
		});
	}

	// -----------------------------------------------------------------
	// Toolbar
	// -----------------------------------------------------------------
	var stepCount = root.querySelector('[data-workflow-count]');
	function updateStepCount() {
		if (stepCount) {
			stepCount.textContent = flow.length + (flow.length === 1 ? ' step' : ' steps');
		}
	}

	var btnClear = root.querySelector('[data-workflow-clear]');
	if (btnClear) {
		btnClear.addEventListener('click', function () {
			flow = [];
			selectedId = null;
			render();
		});
	}

	var statusToggle = root.querySelector('#workflow_status');
	var statusLabel = root.querySelector('[data-workflow-status-label]');
	if (statusToggle && statusLabel) {
		statusToggle.addEventListener('change', function () {
			statusLabel.textContent = this.checked ? 'Active' : 'Paused';
			statusLabel.className = this.checked
				? 'badge bg-soft-success text-success'
				: 'badge bg-soft-warning text-warning';
		});
	}


	// -----------------------------------------------------------------
	// Palette - rendered from BLOCKS so the library stays in one place
	// -----------------------------------------------------------------
	function renderPalette() {
		var wrap = root.querySelector('[data-workflow-palette]');
		if (!wrap) return;

		var q = (paletteQuery || '').toLowerCase();
		var html = '';
		var shown = 0;

		PALETTE.forEach(function (group) {
			var keys = Object.keys(BLOCKS).filter(function (k) {
				if (!group.match(BLOCKS[k])) return false;
				if (!q) return true;
				return (BLOCKS[k].title + ' ' + BLOCKS[k].desc).toLowerCase().indexOf(q) > -1;
			});
			if (!keys.length) return;
			shown += keys.length;

			html += '<div class="workflow-palette-group">' +
				'<div class="workflow-palette-title">' + group.label + '</div>' +
				keys.map(function (k) {
					var b = BLOCKS[k];
					return '<button type="button" class="workflow-block" data-block="' + k + '">' +
						'<i class="ti ' + b.icon + ' ' + (KIND_TINT[b.kind] || '') + '"></i>' +
						'<span>' + b.title + '</span></button>';
				}).join('') +
				'</div>';
		});

		wrap.innerHTML = shown
			? html
			: '<div class="ai-empty py-4"><span class="ai-empty-icon">' +
			'<i class="ti ti-search-off"></i></span><h6>No blocks found</h6>' +
			'<p>Try a different search term.</p></div>';

		bindPalette();
	}

	function bindPalette() {
		root.querySelectorAll('[data-block]').forEach(function (el) {
			el.addEventListener('click', function () {
				addBlock(el.getAttribute('data-block'), pendingInsertAt);
				pendingInsertAt = null;
			});
			el.setAttribute('draggable', 'true');
			el.addEventListener('dragstart', function (e) {
				e.dataTransfer.setData('text/plain', el.getAttribute('data-block'));
				e.dataTransfer.effectAllowed = 'copy';
				el.classList.add('is-dragging');
			});
			el.addEventListener('dragend', function () {
				el.classList.remove('is-dragging');
			});
		});
	}

	var paletteQuery = '';
	var paletteSearch = root.querySelector('[data-workflow-search]');
	if (paletteSearch) {
		paletteSearch.addEventListener('input', function () {
			paletteQuery = paletteSearch.value.trim();
			renderPalette();
		});
	}

	// -----------------------------------------------------------------
	// Validation - surfaced inline on the node and in a summary panel
	// -----------------------------------------------------------------
	function validate() {
		issues = {};

		if (!flow.length) return;

		// the first step has to be a trigger
		var first = BLOCKS[flow[0].type];
		if (!first || first.kind !== 'trigger') {
			issues[flow[0].id] = 'A workflow must start with a trigger.';
		}

		flow.forEach(function (node, i) {
			var block = BLOCKS[node.type];
			if (!block) return;
			var c = node.cfg || {};

			// a trigger anywhere but the first position is disconnected
			if (block.kind === 'trigger' && i > 0) {
				issues[node.id] = 'A trigger can only be the first step - this step is disconnected.';
				return;
			}

			if (block.kind === 'condition') {
				if (!c.field) {
					issues[node.id] = 'Choose the field this condition tests.';
				} else if (!c.operator) {
					issues[node.id] = 'Choose an operator for this condition.';
				} else if (['is empty', 'is not empty'].indexOf(c.operator) === -1 &&
					!String(c.value || '').trim()) {
					issues[node.id] = 'This condition needs a value to compare against.';
				}
				if (block.branches && !issues[node.id]) {
					if (!String(node.yesLabel || '').trim() || !String(node.noLabel || '').trim()) {
						issues[node.id] = 'Both the yes and no branches need a label.';
					}
				}
				return;
			}

			if (block.kind === 'delay') {
				if (!c.duration || parseInt(c.duration, 10) < 1) {
					issues[node.id] = 'Set how long this step should wait.';
				}
				return;
			}

			if (block.kind === 'action') {
				if (node.type === 'send-email' && !c.template) {
					issues[node.id] = 'Pick an email template or write a custom message.';
				} else if (node.type === 'update-field' && (!c.field || !String(c.value || '').trim())) {
					issues[node.id] = 'Choose a field and the value to write.';
				} else if ((node.type === 'add-tag' || node.type === 'remove-tag') && !c.tag) {
					issues[node.id] = 'Choose which tag to apply.';
				} else if (node.type === 'assign-user' && !c.assignee) {
					issues[node.id] = 'Choose who this record is assigned to.';
				} else if (node.type === 'assign-team' && !c.team) {
					issues[node.id] = 'Choose which team receives this record.';
				} else if ((node.type === 'create-task' || node.type === 'create-followup') &&
					!String(c.taskTitle || '').trim()) {
					issues[node.id] = 'Give the task a title.';
				}
			}
		});

		// a workflow with a trigger but nothing else does nothing
		var hasAction = flow.some(function (n) {
			var b = BLOCKS[n.type];
			return b && (b.kind === 'action' || b.kind === 'delay');
		});
		if (flow.length && !hasAction) {
			structuralIssue = 'This workflow has no actions - it will run but do nothing.';
		} else if (!flow.length) {
			structuralIssue = 'Add a trigger to start this workflow.';
		} else {
			structuralIssue = '';
		}
	}

	function renderValidation() {
		// the validation panel sits above the builder, outside `root`
		var panel = document.querySelector('[data-workflow-validation]');
		if (!panel) return;

		var list = Object.keys(issues);
		var total = list.length + (structuralIssue ? 1 : 0);

		if (!total) {
			panel.className = 'alert alert-success py-2 px-3 fs-13 mb-3';
			panel.innerHTML = '<i class="ti ti-circle-check me-1"></i>' +
				'Workflow is valid and ready to activate.';
			panel.classList.remove('d-none');
			return;
		}

		panel.className = 'alert alert-warning py-2 px-3 fs-13 mb-3';
		panel.innerHTML = '<div class="fw-medium mb-1"><i class="ti ti-alert-triangle me-1"></i>' +
			total + (total === 1 ? ' issue' : ' issues') + ' to fix before this workflow can run</div>' +
			'<ul class="mb-0 ps-3">' +
			(structuralIssue ? '<li>' + structuralIssue + '</li>' : '') +
			list.map(function (id) {
				var n = flow.filter(function (x) { return x.id === id; })[0];
				var label = n ? (n.title || BLOCKS[n.type].title) : 'Step';
				return '<li><button type="button" class="btn btn-link p-0 fs-13 align-baseline" ' +
					'data-jump="' + id + '">' + label + '</button> - ' + issues[id] + '</li>';
			}).join('') +
			'</ul>';
		panel.classList.remove('d-none');

		panel.querySelectorAll('[data-jump]').forEach(function (b) {
			b.addEventListener('click', function () {
				selectNode(b.getAttribute('data-jump'));
				var el = canvas.querySelector('[data-node-id="' + b.getAttribute('data-jump') + '"]');
				if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			});
		});
	}

	// -----------------------------------------------------------------
	// Workflow templates
	// -----------------------------------------------------------------
	var TEMPLATES = {
		'assign-leads': {
			name: 'Assign New Leads Automatically',
			desc: 'Route every new lead to an owner by territory as soon as it lands.',
			applies: 'Leads',
			steps: [
				{ type: 'lead-created', cfg: { object: 'Leads', scope: 'All records' } },
				{ type: 'field-check', cfg: { field: 'Region', operator: 'equals', value: 'North America', join: 'AND - all must match' } },
				{ type: 'assign-user', cfg: { assignee: 'Adrian Herrera', method: 'Round robin' } },
				{ type: 'notify-slack', cfg: { notify: 'Record owner', channel: 'In-app notification', message: 'A new lead has been assigned to you.' } }
			]
		},
		'high-value-deal': {
			name: 'High-Value Deal Notification',
			desc: 'Alert sales leadership the moment a deal above $100K is created.',
			applies: 'Deals',
			steps: [
				{ type: 'deal-created', cfg: { object: 'Deals', scope: 'All records' } },
				{ type: 'amount-check', cfg: { field: 'Deal value', operator: 'is greater than', value: '100000', join: 'AND - all must match' } },
				{ type: 'notify-slack', cfg: { notify: 'Whole team', channel: 'Both', message: 'High-value deal {{deal_name}} was just created.' } },
				{ type: 'create-task', cfg: { taskTitle: 'Review high-value deal', assignee: 'Tomas Lindqvist', dueIn: 1, dueUnit: 'Days', priority: 'High' } }
			]
		},
		'lead-followup': {
			name: 'New Lead Follow-up',
			desc: 'Send a welcome email, wait two days, then create a follow-up task.',
			applies: 'Leads',
			steps: [
				{ type: 'lead-created', cfg: { object: 'Leads', scope: 'All records' } },
				{ type: 'send-email', cfg: { template: 'Welcome sequence - step 1', recipient: 'Primary contact', subject: 'Welcome to CRMS, {{first_name}}' } },
				{ type: 'wait-delay', cfg: { duration: 2, unit: 'Days', businessDays: true } },
				{ type: 'create-task', cfg: { taskTitle: 'Call {{first_name}}', assignee: 'Record owner', dueIn: 1, dueUnit: 'Days', priority: 'Medium' } }
			]
		},
		'proposal-followup': {
			name: 'Proposal Follow-up',
			desc: 'Chase a proposal that has not been answered after three days.',
			applies: 'Proposals',
			steps: [
				{ type: 'proposal-created', cfg: { object: 'Proposals', scope: 'All records' } },
				{ type: 'wait-delay', cfg: { duration: 3, unit: 'Days', businessDays: true } },
				{ type: 'status-check', cfg: { field: 'Lead status', operator: 'does not equal', value: 'Accepted', join: 'AND - all must match' } },
				{ type: 'send-email', cfg: { template: 'Proposal follow-up', recipient: 'Primary contact', subject: 'Any questions on the proposal?' } }
			]
		},
		'contract-renewal': {
			name: 'Contract Renewal Reminder',
			desc: 'Warn the account owner 30 days before a contract expires.',
			applies: 'Contracts',
			steps: [
				{ type: 'contract-expiring', cfg: { object: 'Contracts', scope: 'All records' } },
				{ type: 'date-check', cfg: { field: 'Close date', operator: 'is less than', value: '30 days', join: 'AND - all must match' } },
				{ type: 'notify-slack', cfg: { notify: 'Record owner', channel: 'Email', message: 'Contract renews in 30 days.' } },
				{ type: 'create-followup', cfg: { taskTitle: 'Start renewal conversation', assignee: 'Record owner', dueIn: 2, dueUnit: 'Days', priority: 'High' } }
			]
		},
		'invoice-overdue': {
			name: 'Invoice Overdue Notification',
			desc: 'Notify finance and email the customer when an invoice goes past due.',
			applies: 'Invoices',
			steps: [
				{ type: 'invoice-overdue', cfg: { object: 'Invoices', scope: 'All records' } },
				{ type: 'notify-slack', cfg: { notify: 'Whole team', channel: 'Email', message: 'Invoice is overdue.' } },
				{ type: 'send-email', cfg: { template: 'Custom message', recipient: 'Primary contact', subject: 'Invoice {{deal_name}} is overdue' } },
				{ type: 'add-tag', cfg: { tag: 'At Risk' } }
			]
		},
		'customer-onboarding': {
			name: 'New Customer Onboarding',
			desc: 'Kick off onboarding tasks as soon as a deal is won.',
			applies: 'Deals',
			steps: [
				{ type: 'deal-won', cfg: { object: 'Deals', scope: 'All records' } },
				{ type: 'assign-team', cfg: { team: 'Customer Success', queue: 'Round robin within team' } },
				{ type: 'create-task', cfg: { taskTitle: 'Schedule onboarding kick-off', assignee: 'Record owner', dueIn: 2, dueUnit: 'Days', priority: 'High' } },
				{ type: 'send-email', cfg: { template: 'Welcome sequence - step 1', recipient: 'Primary contact', subject: 'Welcome aboard, {{first_name}}' } },
				{ type: 'add-tag', cfg: { tag: 'Enterprise' } }
			]
		},
		'deal-won': {
			name: 'Deal Won Notification',
			desc: 'Celebrate the win and hand the account to finance.',
			applies: 'Deals',
			steps: [
				{ type: 'deal-won', cfg: { object: 'Deals', scope: 'All records' } },
				{ type: 'notify-slack', cfg: { notify: 'Whole team', channel: 'In-app notification', message: '{{deal_name}} just closed for {{deal_value}}.' } },
				{ type: 'send-webhook', cfg: { webhook: 'Deal won - billing sync', method: 'POST' } },
				{ type: 'create-task', cfg: { taskTitle: 'Raise the first invoice', assignee: 'Ellis Vandermeer', dueIn: 1, dueUnit: 'Days', priority: 'High' } }
			]
		}
	};

	function applyTemplate(key) {
		var tpl = TEMPLATES[key];
		if (!tpl) return;

		seq = 0;
		flow = tpl.steps.map(function (s) {
			return { id: nextId(), type: s.type, cfg: JSON.parse(JSON.stringify(s.cfg || {})) };
		});
		selectedId = flow.length ? flow[0].id : null;

		var nameInput = document.getElementById('workflow_name');
		if (nameInput) nameInput.value = tpl.name;
		var descInput = document.getElementById('workflow_desc');
		if (descInput) descInput.value = tpl.desc;
		var moduleSel = document.getElementById('workflow_module');
		if (moduleSel) {
			Array.prototype.forEach.call(moduleSel.options, function (o) {
				if (o.text === tpl.applies) moduleSel.value = o.value || o.text;
			});
		}

		render();
		toast('Template loaded: ' + tpl.name);

		var modal = document.getElementById('workflow_templates_modal');
		if (modal && window.bootstrap) {
			window.bootstrap.Modal.getOrCreateInstance(modal).hide();
		}
	}

	document.querySelectorAll('[data-wf-template]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			applyTemplate(btn.getAttribute('data-wf-template'));
		});
	});

	// -----------------------------------------------------------------
	// Header actions
	// -----------------------------------------------------------------
	function toast(message, tone) {
		var box = document.querySelector('[data-workflow-toast]');
		if (!box) return;
		box.className = 'alert alert-' + (tone || 'success') + ' py-2 px-3 fs-13 mb-3';
		box.textContent = message;
		box.classList.remove('d-none');
		window.clearTimeout(box._t);
		box._t = window.setTimeout(function () { box.classList.add('d-none'); }, 2800);
	}

	function stamp() {
		var el = document.querySelector('[data-workflow-saved]');
		if (el) el.textContent = 'just now';
	}

	var HEADER_ACTIONS = {
		save: function () {
			validate();
			var count = Object.keys(issues).length + (structuralIssue ? 1 : 0);
			if (count) {
				toast('Fix ' + count + ' validation ' + (count === 1 ? 'issue' : 'issues') +
					' before saving.', 'warning');
				renderValidation();
				return;
			}
			stamp();
			toast('Workflow saved and activated.');
		},
		draft: function () {
			stamp();
			toast('Saved as a draft - it will not run until activated.', 'info');
		},
		test: function () {
			validate();
			if (Object.keys(issues).length) {
				toast('Cannot test run - the workflow has validation issues.', 'danger');
				renderValidation();
				return;
			}
			runTest();
		},
		duplicate: function () {
			var nameInput = document.getElementById('workflow_name');
			if (nameInput) nameInput.value = nameInput.value + ' (copy)';
			toast('Workflow duplicated.');
		},
		'delete': function () {
			toast('Workflow moved to the recycle bin.', 'danger');
		}
	};

	document.querySelectorAll('[data-workflow-action]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var fn = HEADER_ACTIONS[btn.getAttribute('data-workflow-action')];
			if (fn) fn();
		});
	});

	// simulated test run, stepping through the canvas
	function runTest() {
		var panel = root.querySelector('[data-workflow-testrun]');
		if (!panel) {
			toast('Test run queued.');
			return;
		}
		panel.classList.remove('d-none');
		panel.innerHTML = '<div class="ai-thinking"><span class="ai-thinking-dots">' +
			'<span></span><span></span><span></span></span> Running a test with a sample record...</div>';

		var i = 0;
		var lines = [];
		var timer = window.setInterval(function () {
			if (i >= flow.length) {
				window.clearInterval(timer);
				lines.push('<li class="is-success"><span class="ai-timeline-time">done</span>' +
					'<p class="ai-timeline-text mb-0">Workflow completed in 1.4s</p></li>');
				panel.innerHTML = '<div class="d-flex align-items-center justify-content-between mb-2">' +
					'<h6 class="mb-0 fs-13"><i class="ti ti-player-play me-1"></i>Test run result</h6>' +
					'<button type="button" class="btn btn-icon btn-sm btn-outline-light shadow" ' +
					'data-testrun-close aria-label="Close"><i class="ti ti-x"></i></button></div>' +
					'<ul class="ai-timeline mb-0">' + lines.join('') + '</ul>';
				var close = panel.querySelector('[data-testrun-close]');
				if (close) {
					close.addEventListener('click', function () { panel.classList.add('d-none'); });
				}
				return;
			}
			var n = flow[i];
			var b = BLOCKS[n.type];
			lines.push('<li class="is-primary"><span class="ai-timeline-time">step ' + (i + 1) + '</span>' +
				'<p class="ai-timeline-text mb-0">' + (n.title || b.title) + ' - ok</p></li>');
			panel.innerHTML = '<ul class="ai-timeline mb-0">' + lines.join('') + '</ul>';
			i++;
		}, 320);
	}

	// -----------------------------------------------------------------
	renderPalette();
	render();

})();
