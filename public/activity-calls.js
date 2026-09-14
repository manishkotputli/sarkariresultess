/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
Description  : AI CRM module - every AI page and the contextual AI panel.

Merged from the per-page scripts into one file. Each section is a self
contained IIFE that early-returns when its page marker is absent, so loading
this file on a page that uses none of it costs nothing at runtime.

Sections
--------
   1. Shared dataset - window.AI_DATA (must stay first)
   2. AI Command Center      (ai-command-center.html)
   3. AI Insights            (ai-insights.html)
   4. AI Lead Scoring        (ai-lead-scoring.html)
   5. Deal Risk Analysis     (deal-risk-analysis.html)
   6. AI Email Composer      (ai-email-composer.html)
   7. Call Summary           (call-summary.html)
   8. Ask Your Data          (ask-your-data.html)
   9. AI Settings            (ai-settings.html)
  10. Contextual AI panel    (embedded on existing CRM pages)

This is a static template: the data below is mock data and no request is made
to any model or API. Replace the AI_DATA section with your own API layer.
*/


/* =======================================================================
   Shared dataset - window.AI_DATA (must stay first)
   ======================================================================= */
window.AI_DATA = (function () {
	"use strict";

	// ---------------------------------------------------------------
	// Helpers shared by the AI pages
	// ---------------------------------------------------------------
	function money(n) {
		return '$' + n.toLocaleString('en-US');
	}

	function moneyShort(n) {
		if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
		if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
		return '$' + n;
	}

	// lead temperature band from a 0-100 score
	function band(score) {
		if (score >= 75) return { key: 'hot', label: 'Hot', tone: 'danger', icon: 'ti-flame' };
		if (score >= 45) return { key: 'warm', label: 'Warm', tone: 'warning', icon: 'ti-temperature' };
		return { key: 'cold', label: 'Cold', tone: 'info', icon: 'ti-snowflake' };
	}

	// deal risk band from a 0-100 health score (higher health = lower risk)
	function riskBand(health) {
		if (health >= 70) return { key: 'low', label: 'Low Risk', tone: 'success' };
		if (health >= 45) return { key: 'medium', label: 'Medium Risk', tone: 'warning' };
		return { key: 'high', label: 'High Risk', tone: 'danger' };
	}

	function escapeHtml(str) {
		return String(str).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}

	// ---------------------------------------------------------------
	// Leads - drives AI Lead Scoring and the command centre
	// ---------------------------------------------------------------
	var leads = [
		{
			id: 'L-2841', name: 'Marcus Whitfield', title: 'VP Operations',
			company: 'Northwind Logistics', avatar: 'avatar-01.jpg',
			email: 'm.whitfield@northwind.io', phone: '+1 415 555 0134',
			score: 92, probability: 78, engagement: 88, quality: 'Excellent',
			source: 'Webinar', owner: 'Adrian Herrera', value: 96000,
			created: '04 Aug 2026', lastActivity: '2 hours ago',
			factors: [
				{ label: 'Opened pricing page 6 times in 5 days', weight: 22, type: 'positive' },
				{ label: 'Job title matches ICP (VP+ Operations)', weight: 18, type: 'positive' },
				{ label: 'Company size 500-1000 employees', weight: 15, type: 'positive' },
				{ label: 'Requested a demo through the website', weight: 20, type: 'positive' },
				{ label: 'Replied to 3 of 4 outbound emails', weight: 17, type: 'positive' },
				{ label: 'No budget confirmed yet', weight: -8, type: 'negative' }
			],
			activities: [
				{ time: '2 hours ago', text: 'Viewed the Enterprise pricing page', icon: 'ti-eye', tone: 'primary' },
				{ time: 'Yesterday', text: 'Replied to "Q3 rollout timeline"', icon: 'ti-mail', tone: 'success' },
				{ time: '3 days ago', text: 'Attended the product webinar', icon: 'ti-device-tv', tone: 'primary' },
				{ time: '5 days ago', text: 'Downloaded the ROI calculator', icon: 'ti-download', tone: 'success' }
			],
			explanation: 'This lead scores in the top 4% of your pipeline. The strongest signals are ' +
				'repeat pricing-page visits and a direct demo request within 5 days of first touch - ' +
				'a pattern that closed at 71% across your last 200 leads. Seniority and company size ' +
				'both match your best-fit customer profile.',
			nextAction: 'Book a discovery call in the next 24 hours',
			nextActionDetail: 'Leads matching this pattern convert 3.1x more often when contacted within one day of a pricing-page visit.'
		},
		{
			id: 'L-2839', name: 'Priya Raghunathan', title: 'Director of IT',
			company: 'Meridian Health', avatar: 'avatar-02.jpg',
			email: 'p.raghunathan@meridianhealth.com', phone: '+1 617 555 0188',
			score: 84, probability: 66, engagement: 74, quality: 'Excellent',
			source: 'Referral', owner: 'Ellis Vandermeer', value: 74500,
			created: '07 Aug 2026', lastActivity: '1 day ago',
			factors: [
				{ label: 'Inbound referral from an existing customer', weight: 25, type: 'positive' },
				{ label: 'Healthcare vertical - 68% historical win rate', weight: 19, type: 'positive' },
				{ label: 'Attended two product webinars', weight: 14, type: 'positive' },
				{ label: 'Security questionnaire submitted', weight: 16, type: 'positive' },
				{ label: 'Long procurement cycle in this vertical', weight: -10, type: 'negative' }
			],
			activities: [
				{ time: '1 day ago', text: 'Submitted the security questionnaire', icon: 'ti-shield-check', tone: 'success' },
				{ time: '4 days ago', text: 'Forwarded the proposal internally', icon: 'ti-send', tone: 'primary' },
				{ time: '1 week ago', text: 'Referred by Arclight Media', icon: 'ti-users', tone: 'success' }
			],
			explanation: 'Referral leads in your CRM close at 2.4x the rate of cold outbound. The security ' +
				'questionnaire is a strong late-stage buying signal. The main drag on the score is the ' +
				'procurement cycle in healthcare, which historically adds 3-5 weeks.',
			nextAction: 'Send the compliance pack and propose a technical review',
			nextActionDetail: 'Deals that clear security review inside 10 days close 40% faster in this vertical.'
		},
		{
			id: 'L-2836', name: 'Tomas Lindqvist', title: 'Head of Procurement',
			company: 'Cobalt Studio', avatar: 'avatar-03.jpg',
			email: 't.lindqvist@cobaltstudio.se', phone: '+46 8 555 0142',
			score: 71, probability: 54, engagement: 62, quality: 'Good',
			source: 'Trade Show', owner: 'Adrian Herrera', value: 48000,
			created: '11 Aug 2026', lastActivity: '3 days ago',
			factors: [
				{ label: 'Met at SaaStock - warm first touch', weight: 15, type: 'positive' },
				{ label: 'Opened the proposal 4 times', weight: 18, type: 'positive' },
				{ label: 'Procurement role - decision influence', weight: 12, type: 'positive' },
				{ label: 'No activity for 3 days', weight: -9, type: 'negative' },
				{ label: 'Competitor mentioned on the last call', weight: -12, type: 'negative' }
			],
			activities: [
				{ time: '3 days ago', text: 'Opened the proposal (4th view)', icon: 'ti-file-text', tone: 'primary' },
				{ time: '6 days ago', text: 'Call - mentioned evaluating two vendors', icon: 'ti-phone', tone: 'warning' },
				{ time: '2 weeks ago', text: 'Met at SaaStock Stockholm', icon: 'ti-users', tone: 'success' }
			],
			explanation: 'Repeat proposal views suggest genuine internal review, but a competitor was named ' +
				'on the last call and there has been no contact for three days. This combination historically ' +
				'precedes a stall in 38% of cases.',
			nextAction: 'Send the competitive comparison and re-engage this week',
			nextActionDetail: 'Leads re-contacted within 5 days of going quiet recover 2.2x more often.'
		},
		{
			id: 'L-2833', name: 'Nadia Okonkwo', title: 'Operations Manager',
			company: 'Ridgeway Manufacturing', avatar: 'avatar-04.jpg',
			email: 'n.okonkwo@ridgeway.co.uk', phone: '+44 20 5550 173',
			score: 58, probability: 37, engagement: 51, quality: 'Fair',
			source: 'Paid Search', owner: 'Priya Raghunathan', value: 38500,
			created: '13 Aug 2026', lastActivity: '5 days ago',
			factors: [
				{ label: 'Downloaded two comparison guides', weight: 12, type: 'positive' },
				{ label: 'Company size fits mid-market segment', weight: 10, type: 'positive' },
				{ label: 'Manager level - limited signing authority', weight: -11, type: 'negative' },
				{ label: 'Has not booked a demo', weight: -14, type: 'negative' },
				{ label: 'Paid search leads convert at 21%', weight: -8, type: 'negative' }
			],
			activities: [
				{ time: '5 days ago', text: 'Downloaded "CRM Buyer\'s Guide"', icon: 'ti-download', tone: 'primary' },
				{ time: '1 week ago', text: 'Visited the features page', icon: 'ti-eye', tone: 'primary' }
			],
			explanation: 'Early-stage research behaviour with no demo booked and no economic buyer identified. ' +
				'Paid-search leads in this segment convert at 21%, well below your 34% average.',
			nextAction: 'Nurture sequence - hold outbound until a demo is booked',
			nextActionDetail: 'Enrol in the 6-touch education sequence and re-score after the next engagement.'
		},
		{
			id: 'L-2830', name: 'Ellis Vandermeer', title: 'CFO',
			company: 'Halcyon Partners', avatar: 'avatar-05.jpg',
			email: 'e.vandermeer@halcyon.partners', phone: '+1 312 555 0119',
			score: 88, probability: 71, engagement: 81, quality: 'Excellent',
			source: 'Outbound', owner: 'Tomas Lindqvist', value: 128000,
			created: '01 Aug 2026', lastActivity: '6 hours ago',
			factors: [
				{ label: 'C-level economic buyer engaged directly', weight: 24, type: 'positive' },
				{ label: 'Asked for contract terms', weight: 21, type: 'positive' },
				{ label: 'Highest deal value in the segment', weight: 16, type: 'positive' },
				{ label: 'Three stakeholders now on the thread', weight: 18, type: 'positive' },
				{ label: 'Budget cycle closes in 6 weeks', weight: -7, type: 'negative' }
			],
			activities: [
				{ time: '6 hours ago', text: 'Asked about multi-year contract terms', icon: 'ti-file-text', tone: 'success' },
				{ time: '2 days ago', text: 'Added CTO and COO to the thread', icon: 'ti-users-plus', tone: 'success' },
				{ time: '4 days ago', text: 'Attended the executive briefing', icon: 'ti-presentation', tone: 'primary' }
			],
			explanation: 'A CFO asking about contract terms is the single strongest late-stage signal in your ' +
				'history - 79% of such leads closed. Multi-stakeholder expansion in the last 48 hours reinforces this.',
			nextAction: 'Send the multi-year pricing proposal today',
			nextActionDetail: 'Contract-terms requests answered within 24 hours close 1.8x more often.'
		},
		{
			id: 'L-2827', name: 'Sofia Marchetti', title: 'Marketing Lead',
			company: 'Arclight Media', avatar: 'avatar-06.jpg',
			email: 's.marchetti@arclight.media', phone: '+39 02 5550 921',
			score: 41, probability: 24, engagement: 38, quality: 'Fair',
			source: 'Content Download', owner: 'Nadia Okonkwo', value: 22000,
			created: '15 Aug 2026', lastActivity: '9 days ago',
			factors: [
				{ label: 'Subscribed to the newsletter', weight: 8, type: 'positive' },
				{ label: 'No engagement in 9 days', weight: -16, type: 'negative' },
				{ label: 'Below target deal size', weight: -10, type: 'negative' },
				{ label: 'Role not in the buying committee', weight: -12, type: 'negative' }
			],
			activities: [
				{ time: '9 days ago', text: 'Downloaded a whitepaper', icon: 'ti-download', tone: 'primary' },
				{ time: '10 days ago', text: 'Subscribed to the newsletter', icon: 'ti-mail', tone: 'primary' }
			],
			explanation: 'Single content download with no follow-through and no buying-committee role. ' +
				'Leads inactive beyond 7 days convert at under 9% without re-engagement.',
			nextAction: 'Move to long-term nurture',
			nextActionDetail: 'Re-score automatically if the lead returns to the pricing or demo page.'
		}
	];

	// ---------------------------------------------------------------
	// Deals - drives Deal Risk Analysis and the command centre
	// ---------------------------------------------------------------
	var deals = [
		{
			id: 'D-1094', name: 'Northwind Logistics - Renewal',
			company: 'Northwind Logistics', owner: 'Adrian Herrera', avatar: 'avatar-01.jpg',
			value: 96000, health: 82, probability: 92, stage: 'Contract Review',
			closeDate: '28 Aug 2026', age: 34, lastContact: '2 hours ago',
			risks: [
				{ label: 'Single-threaded - only one stakeholder engaged', weight: 'Medium' }
			],
			positives: [
				{ label: 'Legal review already underway' },
				{ label: 'Champion responded within 2 hours' },
				{ label: 'Renewal - existing customer since 2024' },
				{ label: 'Budget confirmed by the economic buyer' }
			],
			missing: [
				{ label: 'No executive sponsor call logged' }
			],
			engagement: 88,
			timeline: [
				{ time: '2 hours ago', title: 'Email reply received', text: 'Champion confirmed the redlines are with legal.', tone: 'success' },
				{ time: '2 days ago', title: 'Contract sent', text: 'Multi-year agreement shared for review.', tone: 'primary' },
				{ time: '6 days ago', title: 'Pricing call', text: '45-minute call covering the volume tier.', tone: 'primary' },
				{ time: '2 weeks ago', title: 'Renewal opened', text: 'Deal created from the renewal pipeline.', tone: 'primary' }
			],
			recommendations: [
				'Add a second stakeholder before signature to reduce single-thread risk',
				'Confirm the legal turnaround date in writing this week'
			],
			nextAction: 'Request an executive sponsor introduction',
			summary: 'A healthy renewal in the final stage. Legal review is active and the champion is highly ' +
				'responsive. The only meaningful risk is that the deal remains single-threaded 4 days from ' +
				'the expected close date.'
		},
		{
			id: 'D-1091', name: 'Meridian Health - Expansion',
			company: 'Meridian Health', owner: 'Ellis Vandermeer', avatar: 'avatar-02.jpg',
			value: 74500, health: 54, probability: 61, stage: 'Negotiation',
			closeDate: '04 Sep 2026', age: 62, lastContact: '8 days ago',
			risks: [
				{ label: 'No contact logged for 8 days', weight: 'High' },
				{ label: 'Deal age is 62 days vs 41-day average', weight: 'Medium' },
				{ label: 'Security review still open', weight: 'Medium' }
			],
			positives: [
				{ label: 'Existing customer with a strong support record' },
				{ label: 'Three stakeholders on the thread' }
			],
			missing: [
				{ label: 'No demo scheduled with the clinical team' },
				{ label: 'Pricing not yet agreed in writing' }
			],
			engagement: 47,
			timeline: [
				{ time: '8 days ago', title: 'Last email sent', text: 'Follow-up on security questionnaire - no reply.', tone: 'warning' },
				{ time: '12 days ago', title: 'Security questionnaire', text: 'Submitted to the customer IT team.', tone: 'primary' },
				{ time: '3 weeks ago', title: 'Expansion scoped', text: 'Additional 40 seats discussed.', tone: 'primary' }
			],
			recommendations: [
				'Break the 8-day silence today - engagement drops 31% after 10 days',
				'Escalate the security review to your internal compliance contact',
				'Get pricing agreed in writing before the close date slips again'
			],
			nextAction: 'Call the champion directly - email has gone unanswered twice',
			summary: 'This deal has stalled. Eight days without contact, an open security review and a deal ' +
				'age 51% above your average all point the same way. Expansions that go quiet at this stage ' +
				'slip past their close date 64% of the time.'
		},
		{
			id: 'D-1088', name: 'Cobalt Studio - New Business',
			company: 'Cobalt Studio', owner: 'Priya Raghunathan', avatar: 'avatar-03.jpg',
			value: 48000, health: 38, probability: 34, stage: 'Proposal Sent',
			closeDate: '12 Sep 2026', age: 71, lastContact: '14 days ago',
			risks: [
				{ label: 'Competitor named on the last call', weight: 'High' },
				{ label: 'No contact for 14 days', weight: 'High' },
				{ label: 'Proposal viewed but never discussed', weight: 'Medium' },
				{ label: 'Close date already pushed twice', weight: 'Medium' }
			],
			positives: [
				{ label: 'Proposal opened 4 times' }
			],
			missing: [
				{ label: 'No decision-maker identified' },
				{ label: 'No next meeting booked' },
				{ label: 'Budget never confirmed' }
			],
			engagement: 22,
			timeline: [
				{ time: '14 days ago', title: 'Proposal viewed', text: 'Fourth view, no response to follow-up.', tone: 'warning' },
				{ time: '3 weeks ago', title: 'Discovery call', text: 'Customer mentioned evaluating another vendor.', tone: 'danger' },
				{ time: '6 weeks ago', title: 'Deal created', text: 'Inbound from the trade show list.', tone: 'primary' }
			],
			recommendations: [
				'Run a win-back play or disqualify - this deal is consuming forecast credibility',
				'If re-engaging, lead with the competitive comparison, not a discount',
				'Identify the economic buyer before investing further time'
			],
			nextAction: 'Decide this week: re-engage with a competitive play or mark closed-lost',
			summary: 'The highest-risk deal in the pipeline. A named competitor, two weeks of silence, no ' +
				'identified decision-maker and two close-date pushes. Deals in this state closed 11% of the ' +
				'time historically.'
		},
		{
			id: 'D-1085', name: 'Halcyon Partners - Pilot',
			company: 'Halcyon Partners', owner: 'Tomas Lindqvist', avatar: 'avatar-05.jpg',
			value: 128000, health: 76, probability: 74, stage: 'Negotiation',
			closeDate: '19 Sep 2026', age: 28, lastContact: '6 hours ago',
			risks: [
				{ label: 'Budget cycle closes in 6 weeks', weight: 'Medium' }
			],
			positives: [
				{ label: 'CFO engaged directly as economic buyer' },
				{ label: 'Contract terms requested' },
				{ label: 'Three stakeholders active' },
				{ label: 'Fastest-moving deal in the quarter' }
			],
			missing: [
				{ label: 'Implementation plan not yet shared' }
			],
			engagement: 81,
			timeline: [
				{ time: '6 hours ago', title: 'Terms requested', text: 'CFO asked about multi-year pricing.', tone: 'success' },
				{ time: '2 days ago', title: 'Stakeholders added', text: 'CTO and COO joined the thread.', tone: 'success' },
				{ time: '1 week ago', title: 'Executive briefing', text: 'Full leadership team attended.', tone: 'primary' }
			],
			recommendations: [
				'Send multi-year pricing within 24 hours while intent is high',
				'Attach the implementation plan to pre-empt the next objection'
			],
			nextAction: 'Send the multi-year proposal today',
			summary: 'Your strongest active deal. A CFO requesting contract terms is the highest-converting ' +
				'signal in your history, and stakeholder count has grown in the last 48 hours.'
		},
		{
			id: 'D-1082', name: 'Arclight Media - Upsell',
			company: 'Arclight Media', owner: 'Nadia Okonkwo', avatar: 'avatar-06.jpg',
			value: 62000, health: 64, probability: 58, stage: 'Proposal Sent',
			closeDate: '26 Sep 2026', age: 45, lastContact: '4 days ago',
			risks: [
				{ label: 'Champion changed roles mid-cycle', weight: 'Medium' },
				{ label: 'Usage down 12% quarter on quarter', weight: 'Medium' }
			],
			positives: [
				{ label: 'Existing customer, renewed twice' },
				{ label: 'New champion responded within a day' }
			],
			missing: [
				{ label: 'ROI case not yet presented' }
			],
			engagement: 59,
			timeline: [
				{ time: '4 days ago', title: 'New champion intro', text: 'Handover call with the incoming owner.', tone: 'primary' },
				{ time: '2 weeks ago', title: 'Champion left', text: 'Original contact moved to another team.', tone: 'warning' },
				{ time: '5 weeks ago', title: 'Upsell proposed', text: 'Additional module scoped.', tone: 'primary' }
			],
			recommendations: [
				'Re-run discovery with the new champion - do not assume continuity',
				'Address the 12% usage decline before asking for expansion budget'
			],
			nextAction: 'Present the ROI case to the new champion',
			summary: 'A recoverable deal disrupted by a champion change. The new contact is responsive, but ' +
				'declining usage weakens the expansion argument until it is addressed directly.'
		}
	];

	// ---------------------------------------------------------------
	// Insights - drives AI Insights and the command centre feed
	// ---------------------------------------------------------------
	var insights = [
		{
			id: 'I-01', category: 'risk', severity: 'critical',
			title: '3 deals worth $184K have gone quiet',
			body: 'Meridian Health, Cobalt Studio and two smaller deals have had no logged contact for ' +
				'8+ days. Combined, they represent 22% of your committed forecast this quarter.',
			why: 'Deals with no contact for 8+ days at Negotiation or later slipped past their close date ' +
				'64% of the time across your last 4 quarters.',
			action: 'Review stalled deals', link: 'deal-risk-analysis.html',
			metric: '$184K', metricLabel: 'at risk', icon: 'ti-alert-hexagon', tone: 'danger',
			date: '2026-08-25'
		},
		{
			id: 'I-02', category: 'revenue', severity: 'opportunity',
			title: 'Q3 forecast is tracking 8.4% ahead of last quarter',
			body: 'Weighted forecast now stands at $845K against a $920K quota. Commit-category deals ' +
				'have grown $62K week over week, Partners and Northwind Logistics.',
			why: 'Based on weighted pipeline across 53 open deals using stage-level historical win rates.',
			action: 'Open forecast', link: 'sales-forecasting.html',
			metric: '$845K', metricLabel: 'weighted forecast', icon: 'ti-trending-up', tone: 'success',
			date: '2026-08-25'
		},
		{
			id: 'I-03', category: 'lead', severity: 'high',
			title: '5 high-intent leads have not been contacted in 24 hours',
			body: 'Marcus Whitfield and four others scored above 80 and showed pricing-page intent, but ' +
				'no outreach has been logged since the signal fired.',
			why: 'Leads contacted within 24 hours of a pricing-page visit convert 3.1x more often than ' +
				'those contacted after 48 hours.',
			action: 'Review scored leads', link: 'ai-lead-scoring.html',
			metric: '5', metricLabel: 'leads waiting', icon: 'ti-target-arrow', tone: 'warning',
			date: '2026-08-25'
		},
		{
			id: 'I-04', category: 'customer', severity: 'critical',
			title: 'Arclight Media usage dropped 12% this quarter',
			body: 'Login frequency and active seats have both declined while an upsell is in flight. ' +
				'The account renews in 74 days.',
			why: 'Accounts with a 10%+ usage decline in the quarter before renewal churned at 3.4x the ' +
				'baseline rate.',
			action: 'View account', link: 'companies.html',
			metric: '-12%', metricLabel: 'usage change', icon: 'ti-heart-broken', tone: 'danger',
			date: '2026-08-24'
		},
		{
			id: 'I-05', category: 'performance', severity: 'medium',
			title: 'Tomas Lindqvist is 24% behind quota with 5 weeks left',
			body: 'Closed-won sits at $96K against a $220K quota. Weighted forecast adds $71K, leaving a ' +
				'$53K gap. Activity volume is 31% below team average.',
			why: 'Reps below 80% attainment at this point in the quarter finished below quota in 71% of ' +
				'prior quarters without an intervention.',
			action: 'Open team report', link: 'team-performance-report.html',
			metric: '76%', metricLabel: 'projected attainment', icon: 'ti-user-exclamation', tone: 'warning',
			date: '2026-08-24'
		},
		{
			id: 'I-06', category: 'revenue', severity: 'opportunity',
			title: '$240K of expansion revenue is available in 6 accounts',
			body: 'Six existing customers are at or above 85% seat utilisation with no open expansion ' +
				'deal. Median expansion size in this cohort is $40K.',
			why: 'Accounts crossing 85% utilisation accepted an expansion offer 47% of the time within ' +
				'two quarters.',
			action: 'View accounts', link: 'companies.html',
			metric: '$240K', metricLabel: 'expansion potential', icon: 'ti-coin', tone: 'success',
			date: '2026-08-23'
		},
		{
			id: 'I-07', category: 'deal', severity: 'high',
			title: 'Proposal-to-close time has grown from 12 to 19 days',
			body: 'Average time in the Proposal Sent stage increased 58% over the last two quarters. ' +
				'Eleven deals are currently sitting in this stage beyond 15 days.',
			why: 'Correlated with a drop in follow-up activity within 48 hours of proposal delivery, ' +
				'down from 82% to 54% of proposals.',
			action: 'View pipeline report', link: 'pipeline-stage-report.html',
			metric: '19 days', metricLabel: 'avg. time in stage', icon: 'ti-clock-exclamation', tone: 'warning',
			date: '2026-08-22'
		},
		{
			id: 'I-08', category: 'lead', severity: 'opportunity',
			title: 'Referral leads convert 2.4x better than paid search',
			body: 'Referrals closed at 51% this quarter against 21% for paid search, yet referrals make ' +
				'up only 9% of new lead volume.',
			why: 'Based on 340 leads across six sources over the last two quarters.',
			action: 'View lead report', link: 'lead-reports.html',
			metric: '2.4x', metricLabel: 'conversion advantage', icon: 'ti-users-plus', tone: 'success',
			date: '2026-08-21'
		},
		{
			id: 'I-09', category: 'customer', severity: 'medium',
			title: 'Support ticket volume up 34% for Meridian Health',
			body: 'Fourteen tickets opened in the last 30 days against a 30-day average of 10.4, while an ' +
				'expansion deal is in negotiation.',
			why: 'Elevated ticket volume during an open expansion reduced win rate by 28% historically.',
			action: 'View tickets', link: 'tickets.html',
			metric: '+34%', metricLabel: 'ticket volume', icon: 'ti-lifebuoy', tone: 'warning',
			date: '2026-08-20'
		}
	];

	// ---------------------------------------------------------------
	// Recommended next actions - command centre
	// ---------------------------------------------------------------
	var actions = [
		{
			title: 'Call Meridian Health before the day ends',
			meta: 'Deal stalled 8 days · $74.5K at risk',
			icon: 'ti-phone', tone: 'danger', link: 'deal-risk-analysis.html', cta: 'Open deal'
		},
		{
			title: 'Send multi-year pricing to Halcyon Partners',
			meta: 'CFO requested terms 6 hours ago · $128K',
			icon: 'ti-file-dollar', tone: 'success', link: 'ai-email-composer.html', cta: 'Draft email'
		},
		{
			title: 'Contact Marcus Whitfield - score 92',
			meta: 'Viewed pricing 6x · no outreach logged',
			icon: 'ti-target-arrow', tone: 'warning', link: 'ai-lead-scoring.html', cta: 'View lead'
		},
		{
			title: 'Review the Arclight Media usage decline',
			meta: 'Renews in 74 days · usage down 12%',
			icon: 'ti-heart-broken', tone: 'danger', link: 'ai-insights.html', cta: 'View insight'
		},
		{
			title: 'Coach Tomas Lindqvist on pipeline generation',
			meta: '76% projected attainment · 5 weeks left',
			icon: 'ti-user-exclamation', tone: 'warning', link: 'team-performance-report.html', cta: 'Open report'
		}
	];

	return {
		leads: leads,
		deals: deals,
		insights: insights,
		actions: actions,
		money: money,
		moneyShort: moneyShort,
		band: band,
		riskBand: riskBand,
		escapeHtml: escapeHtml
	};
})();


/* =======================================================================
   AI Command Center      (ai-command-center.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-command]');
	if (!root || !window.AI_DATA) return;

	var D = window.AI_DATA;

	// -----------------------------------------------------------------
	// higher is better -> green / amber / red, using the existing modifiers
	function meterTone(v) {
		return v >= 70 ? ' is-success' : (v >= 45 ? ' is-warning' : ' is-danger');
	}

	// High-priority leads (top scorers that still need outreach)
	// -----------------------------------------------------------------
	var leadWrap = root.querySelector('[data-ai-priority-leads]');
	if (leadWrap) {
		var top = D.leads.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 4);

		var QUALITY_TONE = { Excellent: 'success', Good: 'info', Fair: 'warning', Poor: 'secondary' };

		leadWrap.innerHTML = top.map(function (l) {
			var b = D.band(l.score);
			var tone = QUALITY_TONE[l.quality] || 'secondary';

			return '<div class="ai-row">' +
				// identity + score
				'<div class="d-flex align-items-start gap-2 flex-wrap">' +
				'<span class="avatar avatar-md rounded flex-shrink-0">' +
				'<img src="assets/img/profiles/' + l.avatar + '" alt="' + l.name +
				'" class="img-fluid rounded"></span>' +
				'<div class="flex-grow-1 min-w-0">' +
				'<a href="ai-lead-scoring.html" class="fw-medium text-dark d-block text-truncate">' +
				l.name + '</a>' +
				'<span class="fs-12 text-muted d-block text-truncate">' +
				l.title + ' &middot; ' + l.company + '</span>' +
				'</div>' +
				'<span class="ai-cell-score is-' + b.key + ' flex-shrink-0">' +
				'<span class="ai-cell-dot"></span>' +
				'<span class="ai-cell-value">' + l.score + '</span></span>' +
				'</div>' +

				// status, conversion probability, last activity
				'<div class="d-flex align-items-center gap-2 flex-wrap mt-2">' +
				'<span class="badge bg-soft-' + tone + ' text-' + tone + '">' + l.quality + '</span>' +
				'<span class="ai-meter' + meterTone(l.probability) + ' flex-grow-1" style="min-width:88px;">' +
				'<span class="ai-meter-track"><span class="ai-meter-fill" ' +
				'style="width:' + l.probability + '%"></span></span>' +
				'<span class="ai-meter-value">' + l.probability + '%</span></span>' +
				'<span class="fs-12 text-muted"><i class="ti ti-clock me-1"></i>' +
				l.lastActivity + '</span>' +
				'</div>' +

				// what the rep should do next
				'<p class="ai-row-action"><i class="ti ti-player-track-next"></i>' +
				l.nextAction + '</p>' +
				'</div>';
		}).join('');

		// summary strip so the card ends on information, not blank space
		var avgScore = Math.round(top.reduce(function (a, l) { return a + l.score; }, 0) / top.length);
		var pipeline = top.reduce(function (a, l) { return a + l.value; }, 0);
		var footL = root.querySelector('[data-ai-leads-foot]');
		if (footL) {
			footL.innerHTML =
				summaryCell('Avg. AI score', avgScore) +
				summaryCell('Pipeline value', D.moneyShort(pipeline)) +
				summaryCell('Awaiting contact', top.filter(function (l) {
					return /hour|day/.test(l.lastActivity);
				}).length);
		}
	}

	function summaryCell(label, value) {
		return '<div class="col-4">' +
			'<span class="fs-12 text-muted d-block">' + label + '</span>' +
			'<span class="fs-15 fw-semibold text-dark">' + value + '</span></div>';
	}

	// -----------------------------------------------------------------
	// Deals at risk (lowest health first)
	// -----------------------------------------------------------------
	var dealWrap = root.querySelector('[data-ai-risk-deals]');
	if (dealWrap) {
		var risky = D.deals.slice()
			.filter(function (d) { return d.health < 80; })
			.sort(function (a, b) { return a.health - b.health; })
			.slice(0, 4);

		dealWrap.innerHTML = risky.map(function (d) {
			var r = D.riskBand(d.health);
			// the top-weighted risk factor explains the flag in one line
			var reason = (d.risks && d.risks.length) ? d.risks[0].label : 'No specific risk factor';

			return '<div class="ai-row">' +
				// deal + risk band
				'<div class="d-flex align-items-start gap-2 flex-wrap">' +
				'<div class="flex-grow-1 min-w-0">' +
				'<a href="deal-risk-analysis.html" class="fw-medium text-dark d-block text-truncate">' +
				d.name + '</a>' +
				'<span class="fs-12 text-muted d-block text-truncate">' + d.company +
				' &middot; ' + d.stage + '</span>' +
				'</div>' +
				'<span class="badge bg-soft-' + r.tone + ' text-' + r.tone +
				' flex-shrink-0">' + r.label + '</span>' +
				'</div>' +

				// value, health and expected close
				'<div class="d-flex align-items-center gap-2 flex-wrap mt-2">' +
				'<span class="fs-13 fw-semibold text-dark">' + D.money(d.value) + '</span>' +
				'<span class="ai-meter' + meterTone(d.health) + ' flex-grow-1" style="min-width:80px;">' +
				'<span class="ai-meter-track"><span class="ai-meter-fill" ' +
				'style="width:' + d.health + '%"></span></span>' +
				'<span class="ai-meter-value">' + d.health + '</span></span>' +
				'<span class="fs-12 text-muted"><i class="ti ti-calendar-event me-1"></i>' +
				d.closeDate + '</span>' +
				'</div>' +

				// why it is flagged + how long it has been quiet
				'<p class="ai-row-action is-risk"><i class="ti ti-alert-triangle"></i>' +
				reason + ' &middot; quiet ' + d.lastContact + '</p>' +
				'</div>';
		}).join('');

		var atRisk = risky.reduce(function (a, d) { return a + d.value; }, 0);
		var avgHealth = Math.round(risky.reduce(function (a, d) { return a + d.health; }, 0) / risky.length);
		var footD = root.querySelector('[data-ai-deals-foot]');
		if (footD) {
			footD.innerHTML =
				summaryCell('Value at risk', D.moneyShort(atRisk)) +
				summaryCell('Avg. health', avgHealth) +
				summaryCell('Deals flagged', risky.length);
		}
	}

	// -----------------------------------------------------------------
	// Top AI insights feed
	// -----------------------------------------------------------------
	var feed = root.querySelector('[data-ai-feed]');
	if (feed) {
		var order = { critical: 0, high: 1, opportunity: 2, medium: 3 };
		var top3 = D.insights.slice().sort(function (a, b) {
			return (order[a.severity] || 9) - (order[b.severity] || 9);
		}).slice(0, 3);

		feed.innerHTML = top3.map(function (i) {
			return '<div class="col-lg-4 d-flex">' +
				'<div class="ai-insight is-' + i.severity + '">' +
				'<div class="ai-insight-head">' +
				'<span class="ai-insight-icon bg-soft-' + i.tone + ' text-' + i.tone + '">' +
				'<i class="ti ' + i.icon + '"></i></span>' +
				'<div><h6 class="ai-insight-title">' + i.title + '</h6>' +
				'<span class="fs-12 text-muted text-capitalize">' + i.category + ' · ' + i.severity + '</span></div>' +
				'</div>' +
				'<p class="ai-insight-body">' + i.body + '</p>' +
				'<div class="ai-insight-foot">' +
				'<div><span class="fs-18 fw-bold text-dark">' + i.metric + '</span> ' +
				'<span class="fs-12 text-muted">' + i.metricLabel + '</span></div>' +
				'<a href="' + i.link + '" class="btn btn-sm btn-outline-light shadow">' + i.action +
				' <i class="ti ti-arrow-right ms-1"></i></a>' +
				'</div></div></div>';
		}).join('');
	}

	// -----------------------------------------------------------------
	// Recommended next actions
	// -----------------------------------------------------------------
	var actWrap = root.querySelector('[data-ai-actions]');
	if (actWrap) {
		actWrap.innerHTML = D.actions.map(function (a) {
			return '<div class="ai-action">' +
				'<span class="ai-action-icon bg-soft-' + a.tone + ' text-' + a.tone + '">' +
				'<i class="ti ' + a.icon + '"></i></span>' +
				'<div class="flex-grow-1 min-w-0">' +
				'<h6 class="ai-action-title">' + a.title + '</h6>' +
				'<p class="ai-action-meta">' + a.meta + '</p></div>' +
				'<a href="' + a.link + '" class="btn btn-sm btn-outline-light shadow flex-shrink-0">' + a.cta + '</a>' +
				'</div>';
		}).join('');

		// same summary treatment as the two queues, so the row balances
		var footA = root.querySelector('[data-ai-actions-foot]');
		if (footA) {
			var urgent = D.actions.filter(function (a) { return a.tone === 'danger'; }).length;
			footA.innerHTML =
				summaryCell('Open actions', D.actions.length) +
				summaryCell('Urgent', urgent) +
				summaryCell('Revenue impact', '$372K');
		}
	}

	// -----------------------------------------------------------------
	// Meters + usage bars driven by data-* attributes
	// -----------------------------------------------------------------
	root.querySelectorAll('[data-meter]').forEach(function (el) {
		el.style.width = (parseFloat(el.getAttribute('data-meter')) || 0) + '%';
	});
	root.querySelectorAll('[data-ai-score]').forEach(function (el) {
		el.style.setProperty('--ai-score', parseFloat(el.getAttribute('data-ai-score')) || 0);
	});

	// -----------------------------------------------------------------
	// Charts
	// -----------------------------------------------------------------
	if (typeof ApexCharts !== 'undefined') {

		// pipeline coverage by forecast category
		if (document.querySelector('#ai_pipeline_chart')) {
			new ApexCharts(document.querySelector('#ai_pipeline_chart'), {
				chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'inherit', stacked: true },
				series: [
					{ name: 'Healthy', data: [12, 9, 7, 5] },
					{ name: 'At risk', data: [2, 4, 5, 3] }
				],
				colors: ['#22C55E', '#FF6B6B'],
				plotOptions: { bar: { columnWidth: '45%', borderRadius: 3, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
				dataLabels: { enabled: false },
				xaxis: { categories: ['Qualification', 'Proposal', 'Negotiation', 'Contract'], labels: { style: { fontSize: '12px' } } },
				yaxis: { labels: { style: { fontSize: '12px' } } },
				legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
				grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
				// shared tooltips require intersect:false on bar charts
				tooltip: { shared: true, intersect: false, y: { formatter: function (v) { return v + ' deals'; } } }
			}).render();
		}

		// AI actions taken over the last 7 days
		if (document.querySelector('#ai_activity_chart')) {
			new ApexCharts(document.querySelector('#ai_activity_chart'), {
				chart: { type: 'area', height: 200, toolbar: { show: false }, sparkline: { enabled: false }, fontFamily: 'inherit' },
				series: [
					{ name: 'Leads scored', data: [42, 51, 38, 64, 58, 71, 66] },
					{ name: 'Emails drafted', data: [11, 14, 9, 18, 16, 22, 19] },
					{ name: 'Calls summarised', data: [6, 8, 5, 11, 9, 12, 10] }
				],
				colors: ['#3B44F6', '#22C55E', '#FFA800'],
				stroke: { curve: 'smooth', width: 2 },
				fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.03, stops: [0, 100] } },
				dataLabels: { enabled: false },
				xaxis: {
					categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
					labels: { style: { fontSize: '12px' } }
				},
				yaxis: { labels: { style: { fontSize: '12px' } } },
				legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
				grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
				tooltip: { shared: true, intersect: false }
			}).render();
		}
	}

	// -----------------------------------------------------------------
	// Refresh control - demonstrates the loading state
	// -----------------------------------------------------------------
	// the refresh control lives in the page header, outside `root`
	var refresh = document.querySelector('[data-ai-refresh]');
	var stamp = root.querySelector('[data-ai-stamp]');
	if (refresh && stamp) {
		refresh.addEventListener('click', function () {
			var original = stamp.innerHTML;
			stamp.innerHTML = '<span class="ai-thinking"><span class="ai-thinking-dots">' +
				'<span></span><span></span><span></span></span> Re-analysing your CRM...</span>';
			refresh.disabled = true;
			window.setTimeout(function () {
				stamp.innerHTML = original;
				refresh.disabled = false;
			}, 1600);
		});
	}

})();


/* =======================================================================
   AI Insights            (ai-insights.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-insights]');
	if (!root || !window.AI_DATA) return;

	var D = window.AI_DATA;
	var grid = root.querySelector('[data-insight-grid]');
	var count = root.querySelector('[data-insight-count]');
	var empty = root.querySelector('[data-insight-empty]');
	var loading = root.querySelector('[data-insight-loading]');

	var state = { category: 'all', severity: 'all', period: 'all', q: '' };

	var SEVERITY_RANK = { critical: 0, high: 1, opportunity: 2, medium: 3 };

	// insight.date is ISO; "today" for this static template is fixed so the
	// period filter behaves predictably regardless of when it is viewed.
	var TODAY = new Date('2026-08-25T00:00:00');

	function daysAgo(iso) {
		return Math.round((TODAY - new Date(iso + 'T00:00:00')) / 86400000);
	}

	function card(i) {
		return '<div class="col-xl-4 col-md-6 d-flex">' +
			'<div class="ai-insight is-' + i.severity + '">' +
			'<div class="ai-insight-head">' +
			'<span class="ai-insight-icon bg-soft-' + i.tone + ' text-' + i.tone + '">' +
			'<i class="ti ' + i.icon + '"></i></span>' +
			'<div class="flex-grow-1">' +
			'<h6 class="ai-insight-title">' + i.title + '</h6>' +
			'<div class="d-flex align-items-center gap-2 mt-1">' +
			'<span class="badge bg-soft-' + i.tone + ' text-' + i.tone + ' text-capitalize">' + i.severity + '</span>' +
			'<span class="fs-12 text-muted text-capitalize">' + i.category + '</span>' +
			'<span class="fs-12 text-muted">· ' + daysAgo(i.date) + 'd ago</span>' +
			'</div></div></div>' +

			'<p class="ai-insight-body">' + i.body + '</p>' +

			'<div class="ai-insight-why">' +
			'<span class="ai-chip mb-1"><i class="ti ti-sparkles"></i>Why this surfaced</span><br>' + i.why +
			'</div>' +

			'<div class="ai-insight-foot">' +
			'<div><span class="fs-18 fw-bold text-dark">' + i.metric + '</span> ' +
			'<span class="fs-12 text-muted">' + i.metricLabel + '</span></div>' +
			'<a href="' + i.link + '" class="btn btn-sm btn-outline-light shadow">' + i.action +
			' <i class="ti ti-arrow-right ms-1"></i></a>' +
			'</div></div></div>';
	}

	function apply() {
		var rows = D.insights.filter(function (i) {
			if (state.category !== 'all' && i.category !== state.category) return false;
			if (state.severity !== 'all' && i.severity !== state.severity) return false;
			if (state.period !== 'all' && daysAgo(i.date) > parseInt(state.period, 10)) return false;
			if (state.q) {
				var hay = (i.title + ' ' + i.body + ' ' + i.category).toLowerCase();
				if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
			}
			return true;
		}).sort(function (a, b) {
			return (SEVERITY_RANK[a.severity] || 9) - (SEVERITY_RANK[b.severity] || 9);
		});

		grid.innerHTML = rows.map(card).join('');
		if (count) {
			count.textContent = rows.length + (rows.length === 1 ? ' insight' : ' insights');
		}
		if (empty) empty.classList.toggle('d-none', rows.length > 0);
		grid.classList.toggle('d-none', rows.length === 0);
	}

	// brief loading state so the filter feels like it is doing work
	function applyWithLoading() {
		if (!loading) { apply(); return; }
		loading.classList.remove('d-none');
		grid.classList.add('d-none');
		if (empty) empty.classList.add('d-none');
		window.setTimeout(function () {
			loading.classList.add('d-none');
			apply();
		}, 400);
	}

	// filter controls
	root.querySelectorAll('[data-filter]').forEach(function (el) {
		el.addEventListener('change', function () {
			state[el.getAttribute('data-filter')] = el.value;
			applyWithLoading();
		});
	});

	// category quick-pills
	root.querySelectorAll('[data-cat-pill]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			root.querySelectorAll('[data-cat-pill]').forEach(function (b) {
				b.classList.remove('active');
			});
			btn.classList.add('active');
			state.category = btn.getAttribute('data-cat-pill');
			var sel = root.querySelector('[data-filter="category"]');
			if (sel) sel.value = state.category;
			applyWithLoading();
		});
	});

	var search = root.querySelector('[data-insight-search]');
	if (search) {
		search.addEventListener('input', function () {
			state.q = search.value.trim();
			apply();
		});
	}

	// one reset control sits in the page header, outside `root` - bind both
	document.querySelectorAll('[data-insight-reset]').forEach(function (reset) {
		reset.addEventListener('click', function () {
			state = { category: 'all', severity: 'all', period: 'all', q: '' };
			root.querySelectorAll('[data-filter]').forEach(function (el) { el.value = 'all'; });
			if (search) search.value = '';
			root.querySelectorAll('[data-cat-pill]').forEach(function (b) {
				b.classList.toggle('active', b.getAttribute('data-cat-pill') === 'all');
			});
			applyWithLoading();
		});
	});

	apply();

})();


/* =======================================================================
   AI Lead Scoring        (ai-lead-scoring.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-scoring]');
	if (!root || !window.AI_DATA) return;

	var D = window.AI_DATA;
	var body = root.querySelector('[data-score-body]');
	var empty = root.querySelector('[data-score-empty]');
	var countEl = root.querySelector('[data-score-count]');

	var state = { q: '', band: 'all', owner: 'all', sort: 'score', dir: 'desc' };

	// -----------------------------------------------------------------
	// Table
	// -----------------------------------------------------------------
	function row(l) {
		var b = D.band(l.score);
		return '<tr>' +
			'<td>' +
			'<div class="d-flex align-items-center gap-2">' +
			'<span class="avatar avatar-md rounded flex-shrink-0">' +
			'<img src="assets/img/profiles/' + l.avatar + '" alt="' + l.name + '" class="img-fluid rounded"></span>' +
			'<div class="min-w-0">' +
			'<button type="button" class="fw-medium text-dark bg-transparent border-0 p-0 text-start" ' +
			'data-lead-open="' + l.id + '">' + l.name + '</button>' +
			'<span class="fs-12 text-muted d-block">' + l.title + '</span>' +
			'</div></div></td>' +

			'<td>' + l.company + '</td>' +

			'<td><span class="ai-cell-score is-' + b.key + '">' +
			'<span class="ai-cell-dot"></span><span class="ai-cell-value">' + l.score + '</span>' +
			'<span class="fs-12 text-muted">/100</span></span></td>' +

			'<td><span class="badge bg-soft-' + b.tone + ' text-' + b.tone + '">' +
			'<i class="ti ' + b.icon + ' me-1"></i>' + b.label + '</span></td>' +

			'<td><span class="ai-meter"><span class="ai-meter-track">' +
			'<span class="ai-meter-fill" data-meter="' + l.probability + '"></span></span>' +
			'<span class="ai-meter-value">' + l.probability + '%</span></span></td>' +

			'<td><span class="ai-meter is-info"><span class="ai-meter-track">' +
			'<span class="ai-meter-fill" data-meter="' + l.engagement + '"></span></span>' +
			'<span class="ai-meter-value">' + l.engagement + '</span></span></td>' +

			'<td>' + D.money(l.value) + '</td>' +
			'<td>' + l.owner + '</td>' +
			'<td><span class="fs-12 text-muted">' + l.lastActivity + '</span></td>' +

			'<td class="no-sort">' +
			'<button type="button" class="btn btn-sm btn-outline-light shadow" data-lead-open="' + l.id + '">' +
			'<i class="ti ti-sparkles me-1"></i>Why?</button></td>' +
			'</tr>';
	}

	function apply() {
		var rows = D.leads.filter(function (l) {
			if (state.band !== 'all' && D.band(l.score).key !== state.band) return false;
			if (state.owner !== 'all' && l.owner !== state.owner) return false;
			if (state.q) {
				var hay = (l.name + ' ' + l.company + ' ' + l.title + ' ' + l.email).toLowerCase();
				if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
			}
			return true;
		});

		rows.sort(function (a, b) {
			var x = a[state.sort], y = b[state.sort];
			if (typeof x === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
			if (x === y) return 0;
			return (x > y ? 1 : -1) * (state.dir === 'asc' ? 1 : -1);
		});

		body.innerHTML = rows.map(row).join('');
		body.querySelectorAll('[data-meter]').forEach(function (el) {
			el.style.width = (parseFloat(el.getAttribute('data-meter')) || 0) + '%';
		});
		if (countEl) countEl.textContent = rows.length + ' of ' + D.leads.length + ' leads';
		if (empty) empty.classList.toggle('d-none', rows.length > 0);
	}

	// -----------------------------------------------------------------
	// Score detail modal
	// -----------------------------------------------------------------
	var modalEl = document.getElementById('lead_score_modal');

	function openLead(id) {
		var l = D.leads.filter(function (x) { return x.id === id; })[0];
		if (!l || !modalEl) return;
		var b = D.band(l.score);

		modalEl.querySelector('[data-md-name]').textContent = l.name;
		modalEl.querySelector('[data-md-meta]').textContent = l.title + ' · ' + l.company;
		modalEl.querySelector('[data-md-avatar]').src = 'assets/img/profiles/' + l.avatar;
		modalEl.querySelector('[data-md-email]').textContent = l.email;
		modalEl.querySelector('[data-md-phone]').textContent = l.phone;
		modalEl.querySelector('[data-md-source]').textContent = l.source;
		modalEl.querySelector('[data-md-owner]').textContent = l.owner;
		modalEl.querySelector('[data-md-value]').textContent = D.money(l.value);
		modalEl.querySelector('[data-md-quality]').textContent = l.quality;

		var ring = modalEl.querySelector('[data-md-ring]');
		ring.className = 'ai-score ai-score-lg is-' + b.key;
		ring.style.setProperty('--ai-score', l.score);
		modalEl.querySelector('[data-md-score]').textContent = l.score;

		var badge = modalEl.querySelector('[data-md-band]');
		badge.className = 'badge bg-soft-' + b.tone + ' text-' + b.tone;
		badge.innerHTML = '<i class="ti ' + b.icon + ' me-1"></i>' + b.label + ' Lead';

		modalEl.querySelector('[data-md-prob]').textContent = l.probability + '%';
		modalEl.querySelector('[data-md-prob-bar]').style.width = l.probability + '%';
		modalEl.querySelector('[data-md-eng]').textContent = l.engagement;
		modalEl.querySelector('[data-md-eng-bar]').style.width = l.engagement + '%';

		// scoring factors, strongest contribution first
		modalEl.querySelector('[data-md-factors]').innerHTML = l.factors
			.slice()
			.sort(function (a, b2) { return Math.abs(b2.weight) - Math.abs(a.weight); })
			.map(function (f) {
				var pos = f.type === 'positive';
				return '<li>' +
					'<span class="ai-signal-icon bg-soft-' + (pos ? 'success' : 'danger') +
					' text-' + (pos ? 'success' : 'danger') + '">' +
					'<i class="ti ' + (pos ? 'ti-plus' : 'ti-minus') + '"></i></span>' +
					'<span class="flex-grow-1">' + f.label + '</span>' +
					'<span class="ai-signal-weight text-' + (pos ? 'success' : 'danger') + '">' +
					(pos ? '+' : '') + f.weight + '</span></li>';
			}).join('');

		modalEl.querySelector('[data-md-activities]').innerHTML = l.activities.map(function (a) {
			return '<li class="is-' + a.tone + '">' +
				'<span class="ai-timeline-time">' + a.time + '</span>' +
				'<p class="ai-timeline-text">' + a.text + '</p></li>';
		}).join('');

		modalEl.querySelector('[data-md-explain]').textContent = l.explanation;
		modalEl.querySelector('[data-md-next]').textContent = l.nextAction;
		modalEl.querySelector('[data-md-next-detail]').textContent = l.nextActionDetail;

		window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
	}

	// delegated so it survives table re-renders
	root.addEventListener('click', function (e) {
		var t = e.target.closest('[data-lead-open]');
		if (t) openLead(t.getAttribute('data-lead-open'));
	});

	// -----------------------------------------------------------------
	// Controls
	// -----------------------------------------------------------------
	var search = root.querySelector('[data-score-search]');
	if (search) {
		search.addEventListener('input', function () {
			state.q = search.value.trim();
			apply();
		});
	}

	root.querySelectorAll('[data-score-filter]').forEach(function (el) {
		el.addEventListener('change', function () {
			state[el.getAttribute('data-score-filter')] = el.value;
			apply();
		});
	});

	root.querySelectorAll('[data-sort]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var key = btn.getAttribute('data-sort');
			if (state.sort === key) {
				state.dir = state.dir === 'asc' ? 'desc' : 'asc';
			} else {
				state.sort = key;
				state.dir = 'desc';
			}
			root.querySelectorAll('[data-sort]').forEach(function (b) {
				b.classList.toggle('active', b === btn);
				var ic = b.querySelector('i');
				if (ic) {
					ic.className = b === btn
						? 'ti ' + (state.dir === 'asc' ? 'ti-sort-ascending' : 'ti-sort-descending') + ' ms-1'
						: 'ti ti-arrows-sort ms-1';
				}
			});
			apply();
		});
	});

	apply();

})();


/* =======================================================================
   Deal Risk Analysis     (deal-risk-analysis.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-risk]');
	if (!root || !window.AI_DATA) return;

	var D = window.AI_DATA;
	var list = root.querySelector('[data-risk-list]');
	var panel = root.querySelector('[data-risk-detail]');
	var countEl = root.querySelector('[data-risk-count]');
	var selected = null;
	var filter = 'all';

	// -----------------------------------------------------------------
	// Left list
	// -----------------------------------------------------------------
	function listItem(d) {
		var r = D.riskBand(d.health);
		return '<button type="button" class="ai-action w-100 text-start' +
			(d.id === selected ? ' border-primary' : '') + '" data-risk-open="' + d.id + '">' +
			'<span class="ai-score ai-score-sm is-' + r.key + '" data-ring="' + d.health + '">' +
			'<span class="ai-score-value">' + d.health + '</span></span>' +
			'<div class="flex-grow-1 min-w-0">' +
			'<h6 class="ai-action-title text-truncate">' + d.name + '</h6>' +
			'<p class="ai-action-meta">' + D.money(d.value) + ' · ' + d.stage + '</p>' +
			'</div>' +
			'<span class="badge bg-soft-' + r.tone + ' text-' + r.tone + ' flex-shrink-0">' + r.label + '</span>' +
			'</button>';
	}

	function renderList() {
		var rows = D.deals.filter(function (d) {
			return filter === 'all' || D.riskBand(d.health).key === filter;
		}).sort(function (a, b) { return a.health - b.health; });

		list.innerHTML = rows.length
			? rows.map(listItem).join('')
			: '<div class="ai-empty"><span class="ai-empty-icon"><i class="ti ti-shield-check"></i></span>' +
			'<h6>No deals in this band</h6><p>Try a different risk level.</p></div>';

		list.querySelectorAll('[data-ring]').forEach(function (el) {
			el.style.setProperty('--ai-score', el.getAttribute('data-ring'));
		});
		if (countEl) countEl.textContent = rows.length + (rows.length === 1 ? ' deal' : ' deals');
	}

	// -----------------------------------------------------------------
	// Right panel
	// -----------------------------------------------------------------
	function signalList(items, tone, icon) {
		if (!items || !items.length) {
			return '<li><span class="ai-signal-icon bg-soft-secondary text-secondary">' +
				'<i class="ti ti-minus"></i></span><span class="text-muted">None detected</span></li>';
		}
		return items.map(function (s) {
			return '<li><span class="ai-signal-icon bg-soft-' + tone + ' text-' + tone + '">' +
				'<i class="ti ' + icon + '"></i></span>' +
				'<span class="flex-grow-1">' + s.label + '</span>' +
				(s.weight ? '<span class="ai-signal-weight text-' + tone + '">' + s.weight + '</span>' : '') +
				'</li>';
		}).join('');
	}

	function renderDetail(id) {
		var d = D.deals.filter(function (x) { return x.id === id; })[0];
		if (!d) return;
		var r = D.riskBand(d.health);

		panel.innerHTML =
			'<div class="card mb-3">' +
			'<div class="card-body">' +
			'<div class="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">' +
			'<div class="d-flex align-items-center gap-3 flex-wrap">' +
			'<span class="ai-score ai-score-lg is-' + r.key + '" data-ring="' + d.health + '">' +
			'<span class="ai-score-value">' + d.health + '</span><span class="ai-score-max">health</span></span>' +
			'<div><h5 class="mb-1">' + d.name + '</h5>' +
			'<p class="text-muted fs-13 mb-2">' + d.company + ' · owned by ' + d.owner + '</p>' +
			'<span class="badge bg-soft-' + r.tone + ' text-' + r.tone + '">' + r.label + '</span> ' +
			'<span class="ai-chip"><i class="ti ti-sparkles"></i>AI assessed</span>' +
			'</div></div>' +
			'<a href="deals-details.html" class="btn btn-outline-light shadow">' +
			'<i class="ti ti-external-link me-1"></i>Open deal</a>' +
			'</div>' +

			'<div class="row g-3">' +
			kpi('Deal value', D.money(d.value), 'ti-coin') +
			kpi('Closing probability', d.probability + '%', 'ti-percentage') +
			kpi('Expected close', d.closeDate, 'ti-calendar-event') +
			kpi('Deal age', d.age + ' days', 'ti-clock-hour-4') +
			'</div>' +

			'<div class="ai-insight-why mt-3 mb-0">' +
			'<span class="ai-chip mb-1"><i class="ti ti-sparkles"></i>AI deal summary</span><br>' +
			d.summary + '</div>' +
			'</div></div>' +

			// engagement + timeline + recommendations
			'<div class="row g-3">' +
			'<div class="col-lg-6 d-flex"><div class="card flex-fill mb-0">' +
			'<div class="card-header"><h6 class="mb-0">Customer engagement</h6></div>' +
			'<div class="card-body">' +
			'<div class="d-flex align-items-center justify-content-between mb-2">' +
			'<span class="fs-13">Engagement score</span>' +
			'<span class="fw-bold text-dark">' + d.engagement + '/100</span></div>' +
			'<span class="ai-meter ' + (d.engagement >= 70 ? 'is-success' : d.engagement >= 45 ? 'is-warning' : 'is-danger') + '">' +
			'<span class="ai-meter-track"><span class="ai-meter-fill" data-meter="' + d.engagement + '"></span></span>' +
			'</span>' +
			'<p class="fs-12 text-muted mt-2 mb-3">Last contact ' + d.lastContact + '</p>' +
			'<h6 class="fs-13 mb-2">Sales activity timeline</h6>' +
			'<ul class="ai-timeline">' + d.timeline.map(function (t) {
				return '<li class="is-' + t.tone + '"><span class="ai-timeline-time">' + t.time + '</span>' +
					'<h6 class="ai-timeline-title">' + t.title + '</h6>' +
					'<p class="ai-timeline-text">' + t.text + '</p></li>';
			}).join('') + '</ul>' +
			'</div></div></div>' +

			'<div class="col-lg-6 d-flex"><div class="card flex-fill mb-0">' +
			'<div class="card-header"><h6 class="mb-0"><i class="ti ti-sparkles text-primary me-1"></i>AI recommendations</h6></div>' +
			'<div class="card-body">' +
			'<ul class="ai-signals mb-3">' + d.recommendations.map(function (rec) {
				return '<li><span class="ai-signal-icon bg-soft-primary text-primary">' +
					'<i class="ti ti-arrow-right"></i></span><span>' + rec + '</span></li>';
			}).join('') + '</ul>' +
			'<div class="ai-action mb-0">' +
			'<span class="ai-action-icon bg-soft-primary text-primary"><i class="ti ti-player-track-next"></i></span>' +
			'<div class="flex-grow-1"><h6 class="ai-action-title">Next best action</h6>' +
			'<p class="ai-action-meta">' + d.nextAction + '</p></div></div>' +
			'<div class="d-flex gap-2 mt-3 flex-wrap">' +
			'<a href="ai-email-composer.html" class="btn btn-primary btn-sm"><i class="ti ti-mail me-1"></i>Draft follow-up</a>' +
			'<a href="activities.html" class="btn btn-outline-light shadow btn-sm"><i class="ti ti-checklist me-1"></i>Create task</a>' +
			'</div>' +
			'</div></div></div>' +
			'</div>';

		panel.querySelectorAll('[data-ring]').forEach(function (el) {
			el.style.setProperty('--ai-score', el.getAttribute('data-ring'));
		});
		panel.querySelectorAll('[data-meter]').forEach(function (el) {
			el.style.width = el.getAttribute('data-meter') + '%';
		});
	}

	function kpi(label, value, icon) {
		return '<div class="col-sm-6 col-xxl-3"><div class="border rounded p-3 h-100">' +
			'<div class="d-flex align-items-center gap-1 fs-12 text-muted mb-1">' +
			'<i class="ti ' + icon + '"></i>' + label + '</div>' + 
			'<div class="fs-18 fw-bold text-dark">' + value + '</div></div></div>';
	}

	function select(id) {
		selected = id;
		renderList();
		renderDetail(id);
		if (window.innerWidth < 992) {
			panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	list.addEventListener('click', function (e) {
		var t = e.target.closest('[data-risk-open]');
		if (t) select(t.getAttribute('data-risk-open'));
	});

	root.querySelectorAll('[data-risk-filter]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			root.querySelectorAll('[data-risk-filter]').forEach(function (b) { b.classList.remove('active'); });
			btn.classList.add('active');
			filter = btn.getAttribute('data-risk-filter');
			renderList();
		});
	});

	// open the riskiest deal by default
	var worst = D.deals.slice().sort(function (a, b) { return a.health - b.health; })[0];
	select(worst.id);

})();


/* =======================================================================
   AI Email Composer      (ai-email-composer.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-compose]');
	if (!root) return;

	var output = root.querySelector('[data-compose-output]');
	var subject = root.querySelector('[data-compose-subject]');
	var placeholder = root.querySelector('[data-compose-placeholder]');
	var loading = root.querySelector('[data-compose-loading]');
	var resultWrap = root.querySelector('[data-compose-result]');
	var toast = root.querySelector('[data-compose-toast]');
	var meta = root.querySelector('[data-compose-meta]');

	var history = [];

	function val(name) {
		var el = root.querySelector('[name="' + name + '"]');
		return el ? el.value : '';
	}

	function labelFor(name) {
		var el = root.querySelector('[name="' + name + '"]');
		if (!el || !el.options) return '';
		return el.options[el.selectedIndex].text;
	}

	// -----------------------------------------------------------------
	// Canned copy, keyed on purpose. Tone and length adjust it.
	// -----------------------------------------------------------------
	var BODIES = {
		followup: {
			subject: 'Following up on our conversation, {{first_name}}',
			body: 'Hi {{first_name}},\n\n' +
				'Thanks for taking the time to walk me through how {{company}} is handling operations ' +
				'ahead of the Q3 rollout. The point about reporting overhead across your regional teams ' +
				'stuck with me.\n\n' +
				'Based on what you described, the piece most likely to move the needle is consolidated ' +
				'reporting - teams your size typically recover 6-8 hours a week once that is in place.\n\n' +
				'Would a 20-minute session with your operations lead next week be useful? I can walk ' +
				'through exactly how that would map to your current setup.\n\n' +
				'Best,\n{{sender_name}}'
		},
		proposal: {
			subject: 'Proposal for {{company}} - {{deal_name}}',
			body: 'Hi {{first_name}},\n\n' +
				'Attached is the proposal we discussed, covering the scope your team outlined and the ' +
				'volume tier that fits {{company}}\'s current headcount.\n\n' +
				'Three things worth flagging:\n\n' +
				'- Pricing holds through the end of the quarter\n' +
				'- Implementation runs 3-4 weeks with your team needing roughly 2 hours a week\n' +
				'- The multi-year option reduces the annual figure by 14%\n\n' +
				'Happy to walk through it live if that is easier than reading it cold.\n\n' +
				'Best,\n{{sender_name}}'
		},
		reengage: {
			subject: 'Still the right time, {{first_name}}?',
			body: 'Hi {{first_name}},\n\n' +
				'I have not heard back since we shared the proposal, which usually means one of three ' +
				'things - priorities shifted, the timing moved, or it simply fell down the list.\n\n' +
				'Any of those is completely fine. If {{company}} has paused this for now, just say the ' +
				'word and I will stop chasing.\n\n' +
				'If it is still live, I am happy to jump on a short call and answer whatever is ' +
				'outstanding.\n\n' +
				'Best,\n{{sender_name}}'
		},
		intro: {
			subject: 'Quick question about {{company}}\'s pipeline reporting',
			body: 'Hi {{first_name}},\n\n' +
				'I noticed {{company}} has been scaling the operations team quickly this year. Teams ' +
				'hitting that stage usually run into the same wall - reporting that worked at 20 people ' +
				'stops working at 60.\n\n' +
				'We help operations leads consolidate that into one view without adding tooling overhead.\n\n' +
				'Worth a short conversation, or is this already solved on your side?\n\n' +
				'Best,\n{{sender_name}}'
		},
		renewal: {
			subject: 'Your {{company}} renewal - a few options',
			body: 'Hi {{first_name}},\n\n' +
				'Your agreement renews on {{renewal_date}}, so I wanted to get ahead of it.\n\n' +
				'Usage has been strong this year - your team is at 88% seat utilisation, which is above ' +
				'where most accounts sit. That usually means it is worth reviewing tiers rather than ' +
				'renewing like for like.\n\n' +
				'I have put together two options. Shall I send them over, or would a quick call be ' +
				'easier?\n\n' +
				'Best,\n{{sender_name}}'
		},
		thanks: {
			subject: 'Thanks for your time today, {{first_name}}',
			body: 'Hi {{first_name}},\n\n' +
				'Thanks for the conversation today - genuinely useful context on how {{company}} is ' +
				'structured across regions.\n\n' +
				'To recap what we agreed:\n\n' +
				'- I will send the security documentation by Thursday\n' +
				'- You will loop in your IT lead for the technical review\n' +
				'- We will reconvene the week after next\n\n' +
				'Anything I have missed, just let me know.\n\n' +
				'Best,\n{{sender_name}}'
		}
	};

	var TONE_OPENERS = {
		formal: 'Dear {{first_name}},',
		friendly: 'Hi {{first_name}},',
		direct: '{{first_name}} -',
		consultative: 'Hi {{first_name}},'
	};

	var TONE_NOTE = {
		formal: 'Formal tone applied - contractions removed, closing made more traditional.',
		friendly: 'Friendly tone applied - conversational phrasing, lighter closing.',
		direct: 'Direct tone applied - shorter sentences, the ask moved up.',
		consultative: 'Consultative tone applied - leads with the customer problem before the ask.'
	};

	function highlightVars(text) {
		return text.replace(/\{\{([a-z_]+)\}\}/g,
			'<span class="ai-var">{{$1}}</span>');
	}

	function applyTone(text, tone) {
		var out = text;
		if (tone === 'formal') {
			out = out.replace(/^Hi \{\{first_name\}\},/m, TONE_OPENERS.formal)
				.replace(/\bI have not\b/g, 'I have not')
				.replace(/\bdo not\b/g, 'do not')
				.replace(/Best,/, 'Kind regards,');
		} else if (tone === 'direct') {
			out = out.replace(/^Hi \{\{first_name\}\},/m, TONE_OPENERS.direct)
				.replace(/Would a 20-minute session with your operations lead next week be useful\? I can walk\nthrough exactly how that would map to your current setup\./,
					'Can we book 20 minutes next week?');
		}
		return out;
	}

	function applyLength(text, length) {
		if (length === 'short') {
			// keep greeting, first paragraph and sign-off
			var blocks = text.split('\n\n');
			return [blocks[0], blocks[1], blocks[blocks.length - 1]].join('\n\n');
		}
		if (length === 'long') {
			var parts = text.split('\n\n');
			parts.splice(parts.length - 1, 0,
				'For context, teams in your sector typically see the first measurable change within ' +
				'the first month, and we can share benchmarks from comparable rollouts if that would ' +
				'help build the internal case.');
			return parts.join('\n\n');
		}
		return text;
	}

	// -----------------------------------------------------------------
	function compose() {
		var purpose = val('purpose') || 'followup';
		var pack = BODIES[purpose] || BODIES.followup;
		var body = applyLength(applyTone(pack.body, val('tone')), val('length'));
		return { subject: pack.subject, body: body };
	}

	function paint(draft, note) {
		subject.value = draft.subject;
		output.innerHTML = highlightVars(draft.body);
		if (meta) {
			var words = draft.body.split(/\s+/).filter(Boolean).length;
			meta.innerHTML = '<span class="ai-chip"><i class="ti ti-sparkles"></i>AI draft</span> ' +
				'<span class="fs-12 text-muted ms-2">' + words + ' words · ' +
				labelFor('tone') + ' tone · reading time ' + Math.max(1, Math.round(words / 200)) + ' min</span>' +
				(note ? '<span class="fs-12 text-muted d-block mt-1">' + note + '</span>' : '');
		}
	}

	function generate(note) {
		if (placeholder) placeholder.classList.add('d-none');
		if (resultWrap) resultWrap.classList.add('d-none');
		if (loading) loading.classList.remove('d-none');

		window.setTimeout(function () {
			if (loading) loading.classList.add('d-none');
			if (resultWrap) resultWrap.classList.remove('d-none');
			var draft = compose();
			history.push(draft.body);
			paint(draft, note);
		}, 900);
	}

	function notify(msg, tone) {
		if (!toast) return;
		toast.className = 'alert alert-' + (tone || 'success') + ' py-2 px-3 fs-13 mb-3';
		toast.textContent = msg;
		toast.classList.remove('d-none');
		window.setTimeout(function () { toast.classList.add('d-none'); }, 2600);
	}

	// -----------------------------------------------------------------
	// Controls
	// -----------------------------------------------------------------
	var btnGenerate = root.querySelector('[data-compose-generate]');
	if (btnGenerate) {
		btnGenerate.addEventListener('click', function () {
			if (!val('contact')) {
				notify('Choose a contact before generating a draft.', 'danger');
				return;
			}
			generate();
		});
	}

	// refinement actions all re-run generation with a different note
	var REFINE = {
		regenerate: 'Regenerated with a different angle on the opening.',
		improve: 'Improved - clearer ask, tightened middle paragraph.',
		shorten: 'Shortened - trimmed to the essential ask.',
		expand: 'Expanded - added supporting context and a benchmark reference.',
		followup: 'Follow-up variant - references the previous unanswered email.'
	};

	root.querySelectorAll('[data-compose-refine]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var kind = btn.getAttribute('data-compose-refine');
			var lengthSel = root.querySelector('[name="length"]');
			if (kind === 'shorten' && lengthSel) lengthSel.value = 'short';
			if (kind === 'expand' && lengthSel) lengthSel.value = 'long';
			if (kind === 'followup') {
				var p = root.querySelector('[name="purpose"]');
				if (p) p.value = 'reengage';
			}
			generate(REFINE[kind]);
		});
	});

	// tone switcher in the output toolbar
	root.querySelectorAll('[data-compose-tone]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var tone = btn.getAttribute('data-compose-tone');
			var sel = root.querySelector('[name="tone"]');
			if (sel) sel.value = tone;
			generate(TONE_NOTE[tone]);
		});
	});

	var btnCopy = root.querySelector('[data-compose-copy]');
	if (btnCopy) {
		btnCopy.addEventListener('click', function () {
			var text = subject.value + '\n\n' + output.innerText;
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(text).then(function () {
					notify('Email copied to clipboard.');
				}, function () {
					notify('Could not access the clipboard.', 'danger');
				});
			} else {
				notify('Clipboard is not available in this browser.', 'warning');
			}
		});
	}

	var btnSave = root.querySelector('[data-compose-save]');
	if (btnSave) {
		btnSave.addEventListener('click', function () {
			notify('Saved to your email template library.');
		});
	}

	var btnSend = root.querySelector('[data-compose-send]');
	if (btnSend) {
		btnSend.addEventListener('click', function () {
			notify('Email queued for sending to ' + (labelFor('contact') || 'the selected contact') + '.');
		});
	}

	// insert a merge field at the end of the draft
	root.querySelectorAll('[data-compose-var]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			if (!output || output.innerText.trim() === '') {
				notify('Generate a draft first.', 'warning');
				return;
			}
			var token = btn.getAttribute('data-compose-var');
			output.innerHTML += ' <span class="ai-var">{{' + token + '}}</span>';
			notify('Inserted {{' + token + '}}.');
		});
	});

})();


/* =======================================================================
   Call Summary           (call-summary.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-call]');
	if (!root) return;

	// -----------------------------------------------------------------
	// Transcript search - highlights matches inside the turns
	// -----------------------------------------------------------------
	var search = root.querySelector('[data-call-search]');
	var transcript = root.querySelector('[data-call-transcript]');
	var hitCount = root.querySelector('[data-call-hits]');

	if (search && transcript) {
		// keep the original markup so repeated searches do not compound
		var turns = Array.prototype.map.call(
			transcript.querySelectorAll('.ai-turn-text'),
			function (el) { return { el: el, html: el.innerHTML }; }
		);

		search.addEventListener('input', function () {
			var q = search.value.trim();
			var hits = 0;

			turns.forEach(function (t) {
				if (!q) {
					t.el.innerHTML = t.html;
					t.el.closest('.ai-turn').classList.remove('d-none');
					return;
				}
				var plain = t.html.replace(/<[^>]+>/g, '');
				var found = plain.toLowerCase().indexOf(q.toLowerCase()) > -1;
				t.el.closest('.ai-turn').classList.toggle('d-none', !found);
				if (found) {
					hits++;
					var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
					t.el.innerHTML = t.html.replace(re, '<mark>$1</mark>');
				} else {
					t.el.innerHTML = t.html;
				}
			});

			if (hitCount) {
				hitCount.textContent = q
					? hits + (hits === 1 ? ' match' : ' matches')
					: turns.length + ' turns';
			}
		});
	}

	// -----------------------------------------------------------------
	// Action items - completion state and a live remaining count
	// -----------------------------------------------------------------
	var remaining = root.querySelector('[data-call-remaining]');

	function refreshRemaining() {
		var boxes = root.querySelectorAll('[data-call-task]');
		var open = 0;
		boxes.forEach(function (b) { if (!b.checked) open++; });
		if (remaining) {
			remaining.textContent = open === 0
				? 'All action items complete'
				: open + (open === 1 ? ' action item open' : ' action items open');
			remaining.className = open === 0
				? 'badge bg-soft-success text-success'
				: 'badge bg-soft-warning text-warning';
		}
	}

	root.querySelectorAll('[data-call-task]').forEach(function (box) {
		box.addEventListener('change', function () {
			var label = box.closest('.ai-action');
			if (label) label.classList.toggle('opacity-50', box.checked);
			var text = box.parentElement.querySelector('.ai-action-title');
			if (text) text.style.textDecoration = box.checked ? 'line-through' : '';
			refreshRemaining();
		});
	});
	refreshRemaining();

	// -----------------------------------------------------------------
	// Copy the summary
	// -----------------------------------------------------------------
	// copy control sits in the page header, outside `root`
	var btnCopy = document.querySelector('[data-call-copy]');
	var summary = root.querySelector('[data-call-summary]');
	var toast = root.querySelector('[data-call-toast]');

	function notify(msg, tone) {
		if (!toast) return;
		toast.className = 'alert alert-' + (tone || 'success') + ' py-2 px-3 fs-13 mb-3';
		toast.textContent = msg;
		toast.classList.remove('d-none');
		window.setTimeout(function () { toast.classList.add('d-none'); }, 2400);
	}

	if (btnCopy && summary) {
		btnCopy.addEventListener('click', function () {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(summary.innerText).then(function () {
					notify('Call summary copied to clipboard.');
				}, function () {
					notify('Could not access the clipboard.', 'danger');
				});
			} else {
				notify('Clipboard is not available in this browser.', 'warning');
			}
		});
	}

	document.querySelectorAll('[data-call-toast-msg]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			notify(btn.getAttribute('data-call-toast-msg'));
		});
	});

	// -----------------------------------------------------------------
	// Meters
	// -----------------------------------------------------------------
	root.querySelectorAll('[data-meter]').forEach(function (el) {
		el.style.width = (parseFloat(el.getAttribute('data-meter')) || 0) + '%';
	});
	root.querySelectorAll('[data-ring]').forEach(function (el) {
		el.style.setProperty('--ai-score', el.getAttribute('data-ring'));
	});

	// -----------------------------------------------------------------
	// Talk-ratio chart
	// -----------------------------------------------------------------
	if (typeof ApexCharts !== 'undefined' && document.querySelector('#call_talk_chart')) {
		new ApexCharts(document.querySelector('#call_talk_chart'), {
			chart: { type: 'donut', height: 190, fontFamily: 'inherit' },
			series: [38, 62],
			labels: ['Sales rep', 'Customer'],
			colors: ['#3B44F6', '#22C55E'],
			stroke: { width: 0 },
			dataLabels: { enabled: false },
			legend: { position: 'bottom', fontSize: '12px', markers: { radius: 3 } },
			plotOptions: {
				pie: {
					donut: {
						size: '70%',
						labels: {
							show: true,
							value: { fontSize: '18px', fontWeight: 700, formatter: function (v) { return v + '%'; } },
							total: { show: true, label: 'Customer', fontSize: '11px', formatter: function () { return '62%'; } }
						}
					}
				}
			},
			tooltip: { y: { formatter: function (v) { return v + '% of talk time'; } } }
		}).render();
	}

})();


/* =======================================================================
   Ask Your Data          (ask-your-data.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-ask]');
	if (!root || !window.AI_DATA) return;

	var D = window.AI_DATA;
	var log = root.querySelector('[data-ask-log]');
	var form = root.querySelector('[data-ask-form]');
	var input = root.querySelector('[data-ask-input]');
	var intro = root.querySelector('[data-ask-intro]');
	var recentWrap = root.querySelector('[data-ask-recent]');

	var chartSeq = 0;
	var recent = [];

	// -----------------------------------------------------------------
	// Small builders so answers can mix prose, KPIs, tables and charts
	// -----------------------------------------------------------------
	function kpiRow(items) {
		return '<div class="row g-2 mb-3">' + items.map(function (k) {
			return '<div class="col-sm-6 col-lg-3"><div class="border rounded p-3 h-100">' +
				'<div class="fs-12 text-muted mb-1">' + k.label + '</div>' +
				'<div class="fs-20 fw-bold text-dark">' + k.value + '</div>' +
				(k.sub ? '<div class="fs-12 text-' + (k.tone || 'muted') + '">' + k.sub + '</div>' : '') +
				'</div></div>';
		}).join('') + '</div>';
	}

	function table(cols, rows) {
		return '<div class="table-responsive mb-3"><table class="table table-nowrap mb-0">' +
			'<thead class="table-light"><tr>' +
			cols.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') +
			'</tr></thead><tbody>' +
			rows.map(function (r) {
				return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
			}).join('') +
			'</tbody></table></div>';
	}

	function chartBox() {
		chartSeq += 1;
		return { id: 'ask_chart_' + chartSeq, html: '<div id="ask_chart_' + chartSeq + '" class="mb-3"></div>' };
	}

	function pill(text, tone) {
		return '<span class="badge bg-soft-' + tone + ' text-' + tone + '">' + text + '</span>';
	}

	// -----------------------------------------------------------------
	// Answer library
	// -----------------------------------------------------------------
	function answerClosing() {
		var c = chartBox();
		var rows = D.deals
			.slice()
			.sort(function (a, b) { return b.probability - a.probability; })
			.slice(0, 4)
			.map(function (d) {
				var r = D.riskBand(d.health);
				return ['<a href="deals-details.html" class="fw-medium text-dark">' + d.name + '</a>',
					D.money(d.value), d.stage, d.closeDate,
					'<span class="fw-medium">' + d.probability + '%</span>',
					pill(r.label, r.tone)];
			});

		return {
			text: 'Four deals have a closing probability above 55% with an expected close date inside ' +
				'this quarter. Together they represent <strong>' + D.moneyShort(96000 + 128000 + 62000 + 74500) +
				'</strong> in weighted pipeline. Halcyon Partners and Northwind Logistics are the two most ' +
				'likely to land - both have active buying signals in the last 48 hours.',
			html: kpiRow([
				{ label: 'Deals likely to close', value: '4' },
				{ label: 'Combined value', value: '$360.5K' },
				{ label: 'Weighted value', value: '$252K' },
				{ label: 'Avg. probability', value: '71%', sub: '+6% vs last month', tone: 'success' }
			]) + table(
				['Deal', 'Value', 'Stage', 'Close date', 'Probability', 'Risk'],
				rows
			) + c.html,
			chart: {
				id: c.id,
				options: {
					chart: { type: 'bar', height: 220, toolbar: { show: false }, fontFamily: 'inherit' },
					series: [{ name: 'Probability', data: [92, 74, 61, 58] }],
					colors: ['#3B44F6'],
					plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '55%' } },
					dataLabels: { enabled: true, formatter: function (v) { return v + '%'; } },
					xaxis: {
						categories: ['Northwind Renewal', 'Halcyon Pilot', 'Meridian Expansion', 'Arclight Upsell'],
						labels: { style: { fontSize: '12px' } }
					},
					grid: { borderColor: '#e5e7eb', strokeDashArray: 4 }
				}
			},
			followups: ['Which of these have no meeting booked?', 'What is our current pipeline value?']
		};
	}

	function answerLeads() {
		var rows = D.leads
			.slice()
			.sort(function (a, b) { return b.probability - a.probability; })
			.slice(0, 5)
			.map(function (l) {
				var b = D.band(l.score);
				return ['<a href="ai-lead-scoring.html" class="fw-medium text-dark">' + l.name + '</a>',
					l.company, '<span class="fw-medium">' + l.score + '</span>',
					l.probability + '%', l.source,
					pill(b.label, b.tone)];
			});

		return {
			text: 'Five leads currently score above 55 with a conversion probability worth acting on. ' +
				'<strong>Marcus Whitfield</strong> is the strongest at 92 - six pricing-page views and a ' +
				'demo request inside five days. Referral-sourced leads again dominate the top of this list.',
			html: kpiRow([
				{ label: 'Hot leads', value: '3' },
				{ label: 'Avg. score (top 5)', value: '78.8' },
				{ label: 'Avg. probability', value: '61%' },
				{ label: 'Uncontacted 24h+', value: '5', sub: 'needs attention', tone: 'danger' }
			]) + table(['Lead', 'Company', 'Score', 'Probability', 'Source', 'Band'], rows),
			followups: ['Which leads have not been contacted?', 'Which source converts best?']
		};
	}

	function answerReps() {
		var c = chartBox();
		return {
			text: 'Ellis Vandermeer leads the team at <strong>118% quota attainment</strong>, followed by ' +
				'Adrian Herrera at 101%. Two reps are tracking below 80% with five weeks left in the quarter - ' +
				'Tomas Lindqvist at 76% and Nadia Okonkwo at 61%.',
			html: kpiRow([
				{ label: 'Above quota', value: '2 of 5' },
				{ label: 'Team attainment', value: '91.8%' },
				{ label: 'Top performer', value: 'E. Vandermeer' },
				{ label: 'Needs coaching', value: '2', tone: 'warning', sub: 'below 80%' }
			]) + c.html + table(
				['Sales rep', 'Quota', 'Closed won', 'Attainment'],
				[
					['Ellis Vandermeer', '$150K', '$139K', pill('118%', 'success')],
					['Adrian Herrera', '$220K', '$168K', pill('101%', 'success')],
					['Priya Raghunathan', '$180K', '$121K', pill('93%', 'warning')],
					['Tomas Lindqvist', '$220K', '$96K', pill('76%', 'danger')],
					['Nadia Okonkwo', '$150K', '$58K', pill('61%', 'danger')]
				]
			),
			chart: {
				id: c.id,
				options: {
					chart: { type: 'bar', height: 240, toolbar: { show: false }, fontFamily: 'inherit' },
					series: [{ name: 'Attainment', data: [118, 101, 93, 76, 61] }],
					colors: ['#22C55E', '#22C55E', '#FFA800', '#FF6B6B', '#FF6B6B'],
					plotOptions: { bar: { distributed: true, borderRadius: 3, columnWidth: '45%' } },
					legend: { show: false },
					dataLabels: { enabled: true, formatter: function (v) { return v + '%'; } },
					xaxis: {
						categories: ['Vandermeer', 'Herrera', 'Raghunathan', 'Lindqvist', 'Okonkwo'],
						labels: { style: { fontSize: '11px' } }
					},
					yaxis: { labels: { formatter: function (v) { return v + '%'; }, style: { fontSize: '12px' } } },
					grid: { borderColor: '#e5e7eb', strokeDashArray: 4 }
				}
			},
			followups: ['Why is Tomas behind quota?', 'Show my top-performing sales representatives.']
		};
	}

	function answerAtRisk() {
		return {
			text: 'Three accounts show churn or slip risk this quarter. <strong>Arclight Media</strong> is ' +
				'the most urgent - usage down 12% with a renewal in 74 days and an open upsell. ' +
				'<strong>Meridian Health</strong> has elevated support volume during an active expansion.',
			html: kpiRow([
				{ label: 'Accounts at risk', value: '3' },
				{ label: 'Revenue exposed', value: '$248K', tone: 'danger', sub: 'ARR at risk' },
				{ label: 'Avg. health score', value: '52' },
				{ label: 'Renewals < 90 days', value: '2' }
			]) + table(
				['Account', 'Health', 'Signal', 'Renewal', 'ARR'],
				[
					['<a href="companies.html" class="fw-medium text-dark">Arclight Media</a>',
						pill('38', 'danger'), 'Usage down 12%', '74 days', '$96K'],
					['<a href="companies.html" class="fw-medium text-dark">Meridian Health</a>',
						pill('54', 'warning'), 'Support tickets +34%', '112 days', '$88K'],
					['<a href="companies.html" class="fw-medium text-dark">Cobalt Studio</a>',
						pill('61', 'warning'), 'Champion left', '156 days', '$64K']
				]
			),
			followups: ['What is driving the Arclight usage decline?', 'Which deals are most likely to close this month?']
		};
	}

	function answerPipeline() {
		var c = chartBox();
		return {
			text: 'Total open pipeline is <strong>$1.84M</strong> across 53 deals. Weighted by stage ' +
				'probability that comes to <strong>$845K</strong> against a $920K quota - a coverage ratio ' +
				'of 2.0x, below the 3.0x you typically need at this point in the quarter.',
			html: kpiRow([
				{ label: 'Open pipeline', value: '$1.84M' },
				{ label: 'Weighted forecast', value: '$845K', sub: '+8.4% vs last quarter', tone: 'success' },
				{ label: 'Quota', value: '$920K' },
				{ label: 'Coverage ratio', value: '2.0x', sub: 'below 3.0x target', tone: 'warning' }
			]) + c.html,
			chart: {
				id: c.id,
				options: {
					chart: { type: 'bar', height: 230, toolbar: { show: false }, stacked: true, fontFamily: 'inherit' },
					series: [
						{ name: 'Commit', data: [310, 340, 365, 355, 395, 410] },
						{ name: 'Best Case', data: [120, 145, 130, 160, 175, 190] },
						{ name: 'Pipeline', data: [180, 165, 195, 210, 230, 245] }
					],
					colors: ['#22C55E', '#0DCAF0', '#FFA800'],
					plotOptions: { bar: { columnWidth: '48%', borderRadius: 3, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
					dataLabels: { enabled: false },
					xaxis: { categories: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'], labels: { style: { fontSize: '12px' } } },
					yaxis: { labels: { formatter: function (v) { return '$' + v + 'K'; }, style: { fontSize: '12px' } } },
					legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 3 }, fontSize: '12px' },
					grid: { borderColor: '#e5e7eb', strokeDashArray: 4 }
				}
			},
			followups: ['Which deals have been inactive for more than 30 days?', 'Which customers are at risk?']
		};
	}

	function answerInactive() {
		return {
			text: 'Two deals worth <strong>$122.5K</strong> have had no logged activity for more than 30 days, ' +
				'and a further six have been quiet for 8-29 days. Cobalt Studio is the most exposed - ' +
				'71 days old, no decision-maker identified and a competitor already named.',
			html: kpiRow([
				{ label: 'Inactive 30+ days', value: '2' },
				{ label: 'Value stalled', value: '$122.5K', tone: 'danger' },
				{ label: 'Inactive 8-29 days', value: '6' },
				{ label: 'Avg. days quiet', value: '19' }
			]) + table(
				['Deal', 'Value', 'Days inactive', 'Stage', 'Owner'],
				[
					['<a href="deal-risk-analysis.html" class="fw-medium text-dark">Cobalt Studio - New Business</a>',
						'$48,000', pill('14 days', 'danger'), 'Proposal Sent', 'Priya Raghunathan'],
					['<a href="deal-risk-analysis.html" class="fw-medium text-dark">Meridian Health - Expansion</a>',
						'$74,500', pill('8 days', 'warning'), 'Negotiation', 'Ellis Vandermeer']
				]
			),
			followups: ['Which customers are at risk?', 'Draft a re-engagement email']
		};
	}

	var LIBRARY = [
		{ keys: ['close this month', 'likely to close', 'closing', 'close soon'], fn: answerClosing },
		{ keys: ['conversion probability', 'highest conversion', 'best leads', 'top leads', 'lead'], fn: answerLeads },
		{ keys: ['sales representative', 'sales rep', 'top-performing', 'top performing', 'rep', 'quota', 'team'], fn: answerReps },
		{ keys: ['at risk', 'churn', 'customers at risk', 'risk'], fn: answerAtRisk },
		{ keys: ['pipeline value', 'pipeline', 'forecast'], fn: answerPipeline },
		{ keys: ['inactive', '30 days', 'stalled', 'quiet'], fn: answerInactive }
	];

	function answerFor(q) {
		var l = q.toLowerCase();
		for (var i = 0; i < LIBRARY.length; i++) {
			for (var k = 0; k < LIBRARY[i].keys.length; k++) {
				if (l.indexOf(LIBRARY[i].keys[k]) > -1) return LIBRARY[i].fn();
			}
		}
		return null;
	}

	// -----------------------------------------------------------------
	// Rendering
	// -----------------------------------------------------------------
	function addUser(text) {
		var el = document.createElement('div');
		el.className = 'ai-msg is-user';
		el.innerHTML = '<span class="ai-msg-avatar"><i class="ti ti-user"></i></span>' +
			'<div class="ai-msg-body"><span class="ai-msg-text">' + D.escapeHtml(text) + '</span></div>';
		log.appendChild(el);
	}

	function addThinking() {
		var el = document.createElement('div');
		el.className = 'ai-msg is-ai';
		el.setAttribute('data-thinking', '');
		el.innerHTML = '<span class="ai-msg-avatar"><i class="ti ti-sparkles"></i></span>' +
			'<div class="ai-msg-body">' +
			'<span class="ai-thinking mb-2"><span class="ai-thinking-dots">' +
			'<span></span><span></span><span></span></span> Analysing your CRM data...</span>' +
			'<div class="ai-skeleton mt-2">' +
			'<span style="width:92%"></span><span style="width:78%"></span><span style="width:60%"></span>' +
			'</div></div>';
		log.appendChild(el);
		return el;
	}

	function addAnswer(node, ans, question) {
		if (!ans) {
			node.className = 'ai-msg is-ai';
			node.removeAttribute('data-thinking');
			node.innerHTML = '<span class="ai-msg-avatar"><i class="ti ti-sparkles"></i></span>' +
				'<div class="ai-msg-body"><div class="ai-msg-answer">' +
				'<p class="mb-2">I could not match that to the demo dataset in this template.</p>' +
				'<p class="fs-13 text-muted mb-2">This is a static template, so answers come from a fixed ' +
				'library of example questions. Try one of these:</p>' +
				SUGGESTIONS.slice(0, 3).map(function (s) {
					return '<button type="button" class="ai-suggestion" data-ask-q="' + s + '">' +
						'<i class="ti ti-message-2"></i>' + s + '</button>';
				}).join('') +
				'</div></div>';
			return;
		}

		node.className = 'ai-msg is-ai';
		node.removeAttribute('data-thinking');
		node.innerHTML = '<span class="ai-msg-avatar"><i class="ti ti-sparkles"></i></span>' +
			'<div class="ai-msg-body">' +
			'<div class="ai-msg-answer"><p class="mb-3">' + ans.text + '</p>' + ans.html + '</div>' +
			(ans.followups && ans.followups.length
				? '<div class="mt-2"><span class="fs-12 text-muted d-block mb-2">Follow-up questions</span>' +
				ans.followups.map(function (f) {
					return '<button type="button" class="ai-suggestion" data-ask-q="' + f + '">' +
						'<i class="ti ti-arrow-narrow-right"></i>' + f + '</button>';
				}).join('') + '</div>'
				: '') +
			'<div class="ai-msg-tools">' +
			'<span class="ai-chip ai-chip-muted"><i class="ti ti-database"></i>53 deals · 6 leads</span>' +
			'<button type="button" class="btn btn-icon btn-sm btn-outline-light shadow ms-auto" ' +
			'data-ask-feedback aria-label="Helpful"><i class="ti ti-thumb-up"></i></button>' +
			'<button type="button" class="btn btn-icon btn-sm btn-outline-light shadow" ' +
			'data-ask-feedback aria-label="Not helpful"><i class="ti ti-thumb-down"></i></button>' +
			'</div></div>';

		if (ans.chart && typeof ApexCharts !== 'undefined') {
			var target = node.querySelector('#' + ans.chart.id);
			if (target) new ApexCharts(target, ans.chart.options).render();
		}

		pushRecent(question);
	}

	function ask(q) {
		if (!q) return;
		if (intro) intro.classList.add('d-none');
		addUser(q);
		var node = addThinking();
		log.scrollTop = log.scrollHeight;

		window.setTimeout(function () {
			addAnswer(node, answerFor(q), q);
			log.scrollTop = log.scrollHeight;
		}, 1100);
	}

	// -----------------------------------------------------------------
	// Recent questions
	// -----------------------------------------------------------------
	function pushRecent(q) {
		if (!q || recent.indexOf(q) > -1) return;
		recent.unshift(q);
		recent = recent.slice(0, 5);
		if (!recentWrap) return;
		recentWrap.innerHTML = recent.map(function (r) {
			return '<button type="button" class="ai-suggestion w-100" data-ask-q="' + D.escapeHtml(r) + '">' +
				'<i class="ti ti-history"></i><span class="text-truncate">' + D.escapeHtml(r) + '</span></button>';
		}).join('');
	}

	var SUGGESTIONS = [
		'Which deals are most likely to close this month?',
		'Which leads have the highest conversion probability?',
		'Show my top-performing sales representatives.',
		'Which customers are at risk?',
		'What is our current pipeline value?',
		'Which deals have been inactive for more than 30 days?'
	];

	// -----------------------------------------------------------------
	// Wiring
	// -----------------------------------------------------------------
	if (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var q = input.value.trim();
			if (!q) return;
			input.value = '';
			ask(q);
		});
	}

	// suggestion pills, follow-ups and recents all share one handler
	document.addEventListener('click', function (e) {
		var t = e.target.closest('[data-ask-q]');
		if (t) {
			ask(t.getAttribute('data-ask-q'));
			return;
		}
		var f = e.target.closest('[data-ask-feedback]');
		if (f) {
			var tools = f.closest('.ai-msg-tools');
			if (tools) {
				tools.querySelectorAll('[data-ask-feedback]').forEach(function (b) {
					b.classList.remove('btn-primary');
					b.classList.add('btn-outline-light');
				});
				f.classList.remove('btn-outline-light');
				f.classList.add('btn-primary');
			}
		}
	});

	// clear control sits in the page header, outside `root`
	var clear = document.querySelector('[data-ask-clear]');
	if (clear) {
		clear.addEventListener('click', function () {
			log.innerHTML = '';
			if (intro) intro.classList.remove('d-none');
		});
	}

})();


/* =======================================================================
   AI Settings            (ai-settings.html)
   ======================================================================= */
(function () {
	"use strict";

	var root = document.querySelector('[data-ai-settings]');
	if (!root) return;

	var toast = root.querySelector('[data-settings-toast]');

	function notify(msg, tone) {
		if (!toast) return;
		toast.className = 'alert alert-' + (tone || 'success') + ' py-2 px-3 fs-13';
		toast.textContent = msg;
		toast.classList.remove('d-none');
		window.setTimeout(function () { toast.classList.add('d-none'); }, 2800);
	}

	// -----------------------------------------------------------------
	// Provider -> model list. Keeps the model select meaningful.
	// -----------------------------------------------------------------
	var MODELS = {
		anthropic: ['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Haiku 4.5'],
		openai: ['GPT-5', 'GPT-5 mini', 'GPT-4.1'],
		google: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
		azure: ['Azure GPT-5', 'Azure GPT-4.1'],
		selfhosted: ['Llama 4 70B', 'Mistral Large', 'Custom endpoint']
	};

	var providerSel = root.querySelector('#ai_provider');
	var modelSel = root.querySelector('#ai_model');

	function fillModels() {
		if (!providerSel || !modelSel) return;
		var list = MODELS[providerSel.value] || [];
		modelSel.innerHTML = list.map(function (m, i) {
			return '<option' + (i === 0 ? ' selected' : '') + '>' + m + '</option>';
		}).join('');
	}

	if (providerSel) {
		providerSel.addEventListener('change', function () {
			fillModels();
			notify('Provider switched to ' + providerSel.options[providerSel.selectedIndex].text + '.');
		});
		fillModels();
	}

	// endpoint field only matters for a self-hosted provider
	var endpointRow = root.querySelector('[data-endpoint-row]');
	function toggleEndpoint() {
		if (!endpointRow || !providerSel) return;
		endpointRow.classList.toggle('d-none', providerSel.value !== 'selfhosted');
	}
	if (providerSel) {
		providerSel.addEventListener('change', toggleEndpoint);
		toggleEndpoint();
	}

	// -----------------------------------------------------------------
	// Feature master switch disables its dependent controls
	// -----------------------------------------------------------------
	root.querySelectorAll('[data-feature-toggle]').forEach(function (sw) {
		var targetSel = sw.getAttribute('data-feature-toggle');
		var target = root.querySelector('[data-feature-block="' + targetSel + '"]');

		function sync() {
			if (!target) return;
			target.classList.toggle('opacity-50', !sw.checked);
			target.querySelectorAll('input, select, textarea, button').forEach(function (el) {
				el.disabled = !sw.checked;
			});
		}

		sw.addEventListener('change', function () {
			sync();
			notify((sw.checked ? 'Enabled' : 'Disabled') + ' ' +
				sw.getAttribute('data-feature-name') + '.', sw.checked ? 'success' : 'warning');
		});
		sync();
	});

	// -----------------------------------------------------------------
	// Range inputs mirror their value into the adjacent output
	// -----------------------------------------------------------------
	root.querySelectorAll('[data-range-out]').forEach(function (range) {
		var out = root.querySelector(range.getAttribute('data-range-out'));
		function sync() {
			if (out) out.textContent = range.value + (range.getAttribute('data-range-suffix') || '');
		}
		range.addEventListener('input', sync);
		sync();
	});

	// -----------------------------------------------------------------
	// Usage meters
	// -----------------------------------------------------------------
	root.querySelectorAll('[data-usage]').forEach(function (el) {
		var pct = parseFloat(el.getAttribute('data-usage')) || 0;
		el.style.width = Math.min(pct, 100) + '%';
		var wrap = el.closest('.ai-usage');
		if (wrap) {
			wrap.classList.toggle('is-warning', pct >= 70 && pct < 90);
			wrap.classList.toggle('is-danger', pct >= 90);
		}
	});

	// -----------------------------------------------------------------
	// Save / reset
	// -----------------------------------------------------------------
	// save + reset live in the page header, outside `root`
	var save = document.querySelector('[data-settings-save]');
	if (save) {
		save.addEventListener('click', function () {
			var original = save.innerHTML;
			save.disabled = true;
			save.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
			window.setTimeout(function () {
				save.disabled = false;
				save.innerHTML = original;
				notify('AI settings saved.');
			}, 900);
		});
	}

	var reset = document.querySelector('[data-settings-reset]');
	if (reset) {
		reset.addEventListener('click', function () {
			root.querySelectorAll('input[type="checkbox"]').forEach(function (c) {
				c.checked = c.hasAttribute('data-default-on');
			});
			root.querySelectorAll('[data-range-out]').forEach(function (r) {
				r.value = r.getAttribute('data-default') || r.value;
				r.dispatchEvent(new Event('input'));
			});
			root.querySelectorAll('[data-feature-toggle]').forEach(function (sw) {
				sw.dispatchEvent(new Event('change'));
			});
			if (providerSel) {
				providerSel.value = 'anthropic';
				fillModels();
				toggleEndpoint();
			}
			notify('Settings restored to defaults.', 'warning');
		});
	}

	// key visibility toggle
	root.querySelectorAll('[data-toggle-key]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var field = root.querySelector(btn.getAttribute('data-toggle-key'));
			if (!field) return;
			var show = field.type === 'password';
			field.type = show ? 'text' : 'password';
			btn.innerHTML = '<i class="ti ' + (show ? 'ti-eye-off' : 'ti-eye') + '"></i>';
			btn.setAttribute('aria-label', show ? 'Hide API key' : 'Show API key');
		});
	});

})();


/* =======================================================================
   Contextual AI panel    (embedded on existing CRM pages)
   ======================================================================= */
(function () {
	"use strict";

	var panels = document.querySelectorAll('[data-ai-embed]');
	if (!panels.length) return;

	panels.forEach(function (panel) {

		// meters are declared as data-embed-meter="72"
		panel.querySelectorAll('[data-embed-meter]').forEach(function (el) {
			el.style.width = (parseFloat(el.getAttribute('data-embed-meter')) || 0) + '%';
		});

		var toggle = panel.querySelector('[data-ai-embed-toggle]');
		var body = panel.querySelector('[data-ai-embed-body]');
		if (!toggle || !body) return;

		toggle.addEventListener('click', function () {
			var hidden = body.classList.toggle('d-none');
			toggle.setAttribute('aria-expanded', String(!hidden));
			toggle.setAttribute('aria-label', hidden ? 'Show AI panel' : 'Hide AI panel');
			toggle.innerHTML = '<i class="ti ' +
				(hidden ? 'ti-chevron-down' : 'ti-chevron-up') + '"></i>';
		});
	});

})();
