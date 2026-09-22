INSERT INTO public.companies (name, industry, country, city, website, employees, segment, account_manager, revenue_12m, active_projects, contract_status, health_score, health_label, client_since, last_activity_at, notes) VALUES
('Meridian Bank','Banking','Croatia','Zagreb','meridianbank.hr',4200,'Enterprise','Marko Jovanovski',1240000,4,'Active',92,'Healthy','2019-03-01', now() - interval '2 days','Core banking modernisation programme, three squads engaged.'),
('Global Systems','Manufacturing','Germany','Munich','global-systems.de',18500,'Enterprise','Ivana Mitrevska',2180000,6,'Active',64,'Needs attention','2017-09-15', now() - interval '9 days','Largest account. Delivery pressure on the MES rollout.'),
('FinCore','Financial Services','Austria','Vienna','fincore.at',900,'Mid-market','Elena Stojanova',865000,3,'Active',88,'Healthy','2020-06-01', now() - interval '1 day','Payments platform, strong relationship with the CTO.'),
('NovaTech','Technology','Netherlands','Utrecht','novatech.nl',450,'Mid-market','Nikola Trajkovski',640000,2,'Active',85,'Healthy','2021-02-10', now() - interval '4 days','Platform team augmentation.'),
('Adriatic Telecom','Telecommunications','Croatia','Split','adriatic-telecom.hr',6100,'Enterprise','Stefan Gjorgjiev',1470000,5,'Active',90,'Healthy','2018-11-20', now(),'Multi-year framework, quarterly steering committee.'),
('TechVision','Software','Slovenia','Ljubljana','techvision.si',320,'Mid-market','Maja Dimitrievska',520000,2,'Expiring soon',61,'Needs attention','2020-01-15', now() - interval '16 days','Contract expires in under 90 days, renewal not started.'),
('Enterprise Solutions','Consulting','Serbia','Belgrade','entsolutions.rs',780,'Mid-market','Filip Nikolovski',310000,1,'Active',79,'Healthy','2022-04-01', now() - interval '6 days','Single project, potential to expand into data.'),
('Balkan Digital','Media','North Macedonia','Skopje','balkandigital.mk',210,'SMB','Filip Nikolovski',455000,3,'Active',58,'Needs attention','2019-08-01', now() - interval '22 days','Slow payments, low contact frequency.'),
('KapitalPro','Insurance','Bulgaria','Sofia','kapitalpro.bg',1500,'Mid-market','Bojan Stefanovski',780000,2,'Active',38,'At risk','2018-05-10', now() - interval '31 days','No contact in 31 days, one severity-1 issue unresolved.'),
('Helios Energy','Energy','Greece','Athens','helios-energy.gr',2400,'Enterprise','Sara Angelovska',395000,2,'Draft',81,'Healthy','2023-01-09', now() - interval '3 days','Framework agreement still in legal review.'),
('Vertex Logistics','Logistics','Romania','Bucharest','vertexlogistics.ro',3300,'Mid-market','Damjan Ristovski',240000,1,'Active',77,'Healthy','2022-10-01', now() - interval '8 days','Warehouse tracking project.'),
('Northwind Retail','Retail','Poland','Warsaw','northwind-retail.pl',9800,'Enterprise','Ana Petrovska',1010000,3,'Active',73,'Healthy','2021-07-05', now() - interval '5 days','E-commerce replatforming, phase two scoping.'),
('Danube Pharma','Pharmaceuticals','Hungary','Budapest','danubepharma.hu',5200,'Enterprise','Elena Stojanova',690000,2,'Active',69,'Needs attention','2020-09-14', now() - interval '12 days','Validation-heavy delivery, compliance audits pending.'),
('Alpine Insurance','Insurance','Switzerland','Zurich','alpine-insure.ch',2700,'Enterprise','Marko Jovanovski',1120000,3,'Active',86,'Healthy','2019-01-22', now() - interval '7 days','Claims automation programme.');

INSERT INTO public.contacts (company_id, full_name, job_title, email, phone, is_primary, last_contacted_at)
SELECT c.id, v.full_name, v.job_title, v.email, v.phone, v.is_primary, now() - (v.days || ' days')::interval
FROM (VALUES
('Meridian Bank','Ines Kovač','Chief Technology Officer','ines.kovac@meridianbank.hr','+385 1 555 0121',true,2),
('Meridian Bank','Petar Horvat','Head of Digital Channels','petar.horvat@meridianbank.hr','+385 1 555 0148',false,5),
('Global Systems','Lukas Brandt','VP Engineering','lukas.brandt@global-systems.de','+49 89 4400 221',true,9),
('Global Systems','Anja Richter','Procurement Lead','anja.richter@global-systems.de','+49 89 4400 233',false,14),
('FinCore','Thomas Gruber','CTO','thomas.gruber@fincore.at','+43 1 205 3311',true,1),
('NovaTech','Sanne de Vries','Head of Platform','sanne@novatech.nl','+31 30 210 4455',true,4),
('Adriatic Telecom','Mate Perić','Programme Director','mate.peric@adriatic-telecom.hr','+385 21 330 900',true,1),
('TechVision','Nina Zupan','COO','nina.zupan@techvision.si','+386 1 620 7788',true,16),
('Enterprise Solutions','Vuk Milić','Delivery Lead','vuk.milic@entsolutions.rs','+381 11 445 2200',true,6),
('Balkan Digital','Emilija Nikolova','CEO','emilija@balkandigital.mk','+389 2 310 4488',true,22),
('KapitalPro','Georgi Ivanov','Head of IT','georgi.ivanov@kapitalpro.bg','+359 2 900 1122',true,31),
('Helios Energy','Dimitra Papas','Digital Director','d.papas@helios-energy.gr','+30 21 0778 4411',true,3),
('Vertex Logistics','Radu Popescu','CIO','radu.popescu@vertexlogistics.ro','+40 21 320 5566',true,8),
('Northwind Retail','Katarzyna Lis','Head of E-commerce','k.lis@northwind-retail.pl','+48 22 500 3311',true,5),
('Danube Pharma','Bence Tóth','IT Compliance Lead','bence.toth@danubepharma.hu','+36 1 445 7788',true,12),
('Alpine Insurance','Claudia Meier','Head of Claims','claudia.meier@alpine-insure.ch','+41 44 220 8899',true,7)
) AS v(company, full_name, job_title, email, phone, is_primary, days)
JOIN public.companies c ON c.name = v.company;

INSERT INTO public.opportunities (company_id, name, stage, value, probability, owner, source, expected_close, next_step)
SELECT c.id, v.name, v.stage, v.value, v.prob, v.owner, v.source, CURRENT_DATE + (v.days || ' days')::interval, v.next_step
FROM (VALUES
('Meridian Bank','Core banking phase 3','Negotiation',480000,75,'Marko Jovanovski','Existing client',24,'Legal review of the MSA addendum'),
('Meridian Bank','Mobile app redesign','Proposal',180000,50,'Ana Petrovska','Referral',41,'Send revised estimate'),
('Global Systems','MES rollout wave 2','Negotiation',720000,65,'Ivana Mitrevska','Existing client',18,'Align on penalty clauses'),
('Global Systems','Data platform migration','Qualification',260000,25,'Ivana Mitrevska','Inbound',75,'Discovery workshop'),
('FinCore','Payments hub extension','Proposal',210000,55,'Elena Stojanova','Existing client',33,'Present architecture options'),
('NovaTech','Platform team +3 engineers','Closing',145000,90,'Nikola Trajkovski','Existing client',9,'Await signed order form'),
('Adriatic Telecom','BSS integration','Proposal',390000,45,'Stefan Gjorgjiev','Tender',52,'Submit tender response'),
('TechVision','Renewal + QA automation','Qualification',160000,30,'Maja Dimitrievska','Existing client',66,'Book renewal conversation'),
('Northwind Retail','Checkout replatform','Discovery',310000,20,'Ana Petrovska','Inbound',88,'Scope phase two'),
('Alpine Insurance','Claims automation phase 2','Proposal',420000,60,'Marko Jovanovski','Existing client',37,'Business case review'),
('Helios Energy','Field service app','Discovery',120000,15,'Sara Angelovska','Conference',95,'Qualify budget'),
('Danube Pharma','Validation toolchain','Qualification',175000,35,'Elena Stojanova','Referral',70,'Compliance requirements call'),
('Vertex Logistics','Fleet tracking expansion','Closing',95000,85,'Damjan Ristovski','Existing client',12,'Final pricing sign-off'),
('Balkan Digital','Analytics retainer','Qualification',72000,25,'Filip Nikolovski','Existing client',60,'Re-engage sponsor')
) AS v(company, name, stage, value, prob, owner, source, days, next_step)
JOIN public.companies c ON c.name = v.company;

INSERT INTO public.projects (company_id, name, code, status, delivery_manager, start_date, end_date, budget, spent, progress, team_size, billing_model)
SELECT c.id, v.name, v.code, v.status, v.dm, CURRENT_DATE - (v.started || ' days')::interval, CURRENT_DATE + (v.ends || ' days')::interval, v.budget, v.spent, v.progress, v.team, v.billing
FROM (VALUES
('Meridian Bank','Core Banking Modernisation','MB-CORE-01','On track','Jovana Stefanova',210,150,980000,610000,62,14,'Time and materials'),
('Meridian Bank','Digital Onboarding','MB-ONB-02','At risk','Kristijan Angelov',120,60,260000,205000,71,6,'Fixed price'),
('Global Systems','MES Rollout Wave 1','GS-MES-01','Behind plan','Jovana Stefanova',300,45,1250000,1090000,78,18,'Time and materials'),
('Global Systems','IoT Gateway Platform','GS-IOT-02','On track','Viktor Ilievski',150,210,540000,230000,42,9,'Time and materials'),
('FinCore','Payments Hub','FC-PAY-01','On track','Kristijan Angelov',180,90,470000,330000,68,8,'Fixed price'),
('NovaTech','Platform Engineering Squad','NT-PES-01','On track','Viktor Ilievski',260,120,420000,300000,71,5,'Team as a service'),
('Adriatic Telecom','BSS Integration','AT-BSS-01','On track','Jovana Stefanova',95,190,610000,240000,39,11,'Time and materials'),
('TechVision','QA Automation','TV-QA-01','On hold','Marija Trajanova',140,30,180000,150000,83,4,'Fixed price'),
('Northwind Retail','E-commerce Replatform','NR-ECOM-01','On track','Marija Trajanova',110,240,720000,280000,38,12,'Time and materials'),
('Alpine Insurance','Claims Automation','AI-CLM-01','On track','Kristijan Angelov',170,140,560000,360000,64,10,'Fixed price'),
('Danube Pharma','Validation Toolchain','DP-VAL-01','At risk','Marija Trajanova',80,160,290000,150000,45,6,'Time and materials'),
('Vertex Logistics','Fleet Tracking','VL-FLT-01','On track','Viktor Ilievski',200,70,240000,190000,79,5,'Fixed price'),
('Balkan Digital','Data Warehouse','BD-DWH-01','Behind plan','Marija Trajanova',130,50,195000,160000,74,4,'Time and materials'),
('KapitalPro','Policy Portal','KP-POL-01','At risk','Kristijan Angelov',240,20,380000,355000,88,7,'Fixed price')
) AS v(company, name, code, status, dm, started, ends, budget, spent, progress, team, billing)
JOIN public.companies c ON c.name = v.company;

INSERT INTO public.contracts (company_id, title, contract_type, value, start_date, end_date, status, owner, auto_renew, notice_days)
SELECT c.id, v.title, v.ctype, v.value, CURRENT_DATE - (v.started || ' days')::interval, CURRENT_DATE + (v.ends || ' days')::interval, v.status, v.owner, v.renew, v.notice
FROM (VALUES
('Meridian Bank','Master Services Agreement','Framework',2400000,700,420,'Active','Marko Jovanovski',true,90),
('Meridian Bank','Core Banking SOW 3','Statement of work',480000,60,300,'Active','Marko Jovanovski',false,30),
('Global Systems','Framework Agreement 2024','Framework',3600000,540,75,'Expiring soon','Ivana Mitrevska',false,90),
('FinCore','Payments Hub SOW','Statement of work',470000,180,190,'Active','Elena Stojanova',false,30),
('NovaTech','Team as a Service','Retainer',420000,260,45,'Expiring soon','Nikola Trajkovski',true,60),
('Adriatic Telecom','Multi-year Framework','Framework',2900000,420,640,'Active','Stefan Gjorgjiev',true,120),
('TechVision','QA Automation Agreement','Statement of work',180000,140,38,'Expiring soon','Maja Dimitrievska',false,30),
('Enterprise Solutions','Consulting Agreement','Framework',310000,200,150,'Active','Filip Nikolovski',false,30),
('Balkan Digital','Data Services Agreement','Retainer',195000,130,22,'Expiring soon','Filip Nikolovski',false,30),
('KapitalPro','Policy Portal Agreement','Statement of work',380000,240,-15,'Expired','Bojan Stefanovski',false,30),
('Helios Energy','Framework Agreement','Framework',600000,20,340,'Draft','Sara Angelovska',false,60),
('Vertex Logistics','Fleet Tracking SOW','Statement of work',240000,200,80,'Active','Damjan Ristovski',false,30),
('Northwind Retail','Replatform Framework','Framework',1400000,110,430,'Active','Ana Petrovska',true,90),
('Danube Pharma','Validation Services','Statement of work',290000,80,170,'Active','Elena Stojanova',false,45),
('Alpine Insurance','Claims Programme MSA','Framework',1800000,380,290,'Active','Marko Jovanovski',true,90)
) AS v(company, title, ctype, value, started, ends, status, owner, renew, notice)
JOIN public.companies c ON c.name = v.company;

INSERT INTO public.consultants (full_name, job_title, seniority, location, availability, available_from, utilization, day_rate, current_project) VALUES
('Aleksandar Petkovski','Senior Java Engineer','Senior','Skopje','Assigned', CURRENT_DATE + 95, 100, 620,'MB-CORE-01'),
('Teodora Ilieva','Cloud Architect','Principal','Skopje','Partially available', CURRENT_DATE + 21, 60, 820,'GS-IOT-02'),
('Bojan Kostov','React Developer','Mid','Bitola','Assigned', CURRENT_DATE + 60, 100, 480,'NR-ECOM-01'),
('Sara Ristova','QA Automation Engineer','Senior','Skopje','Available', CURRENT_DATE, 0, 520,NULL),
('Dejan Markovski','DevOps Engineer','Senior','Belgrade','Assigned', CURRENT_DATE + 130, 90, 600,'AT-BSS-01'),
('Milica Jovanović','Business Analyst','Mid','Novi Sad','Partially available', CURRENT_DATE + 14, 50, 420,'FC-PAY-01'),
('Kiril Stojanov','Data Engineer','Senior','Skopje','Assigned', CURRENT_DATE + 40, 100, 640,'BD-DWH-01'),
('Ana Georgieva','UX Designer','Senior','Sofia','Available', CURRENT_DATE + 7, 20, 500,NULL),
('Marko Petrov','Salesforce Consultant','Mid','Skopje','Available', CURRENT_DATE, 0, 470,NULL),
('Elena Naumova','Scrum Master','Senior','Ohrid','Assigned', CURRENT_DATE + 75, 100, 540,'AI-CLM-01'),
('Ivan Trajkov','Kotlin Mobile Engineer','Mid','Skopje','Partially available', CURRENT_DATE + 28, 70, 510,'MB-ONB-02'),
('Nada Spasovska','Security Engineer','Principal','Skopje','Available', CURRENT_DATE + 3, 30, 790,NULL);

INSERT INTO public.skills (name, category) VALUES
('Java','Engineering'),('Spring Boot','Engineering'),('React','Engineering'),('TypeScript','Engineering'),
('Kubernetes','Cloud'),('AWS','Cloud'),('Azure','Cloud'),('Terraform','Cloud'),
('Playwright','Quality'),('Test automation','Quality'),('Kotlin','Mobile'),('Swift','Mobile'),
('dbt','Data'),('Snowflake','Data'),('Python','Data'),('UX research','Design'),
('Figma','Design'),('Scrum','Delivery'),('Business analysis','Delivery'),('Application security','Security');

INSERT INTO public.consultant_skills (consultant_id, skill_id, level, years)
SELECT co.id, s.id, v.level, v.years
FROM (VALUES
('Aleksandar Petkovski','Java',5,9.0),('Aleksandar Petkovski','Spring Boot',5,8.0),('Aleksandar Petkovski','Kubernetes',3,3.0),
('Teodora Ilieva','AWS',5,7.0),('Teodora Ilieva','Terraform',5,6.0),('Teodora Ilieva','Kubernetes',5,6.5),
('Bojan Kostov','React',4,4.0),('Bojan Kostov','TypeScript',4,4.5),
('Sara Ristova','Playwright',5,5.0),('Sara Ristova','Test automation',5,7.0),
('Dejan Markovski','Kubernetes',5,6.0),('Dejan Markovski','Azure',4,5.0),('Dejan Markovski','Terraform',4,4.0),
('Milica Jovanović','Business analysis',4,5.0),('Milica Jovanović','Scrum',3,3.0),
('Kiril Stojanov','dbt',5,4.0),('Kiril Stojanov','Snowflake',4,4.0),('Kiril Stojanov','Python',5,8.0),
('Ana Georgieva','Figma',5,7.0),('Ana Georgieva','UX research',5,6.0),
('Marko Petrov','TypeScript',3,3.0),('Marko Petrov','React',3,2.5),
('Elena Naumova','Scrum',5,8.0),
('Ivan Trajkov','Kotlin',4,5.0),('Ivan Trajkov','Swift',3,2.0),
('Nada Spasovska','Application security',5,10.0),('Nada Spasovska','Python',4,6.0)
) AS v(consultant, skill, level, years)
JOIN public.consultants co ON co.full_name = v.consultant
JOIN public.skills s ON s.name = v.skill;

INSERT INTO public.candidates (full_name, role_applied, stage, source, seniority, location, expected_salary, recruiter, rating, applied_at, next_interview_at, notes) VALUES
('Viktorija Angelova','Senior React Developer','Interview','LinkedIn','Senior','Skopje',3400,'Tamara Petrovska',4, CURRENT_DATE - 12, now() + interval '2 days','Strong portfolio, needs notice period check.'),
('Goran Ilievski','Java Engineer','Screening','Referral','Mid','Bitola',2600,'Tamara Petrovska',3, CURRENT_DATE - 5, now() + interval '4 days','Referred by Aleksandar.'),
('Maja Nikolovska','QA Engineer','Offer','Job board','Mid','Skopje',2300,'Dragan Sekulovski',5, CURRENT_DATE - 24, NULL,'Offer sent, awaiting response.'),
('Stefan Dimov','DevOps Engineer','Interview','LinkedIn','Senior','Sofia',3800,'Dragan Sekulovski',4, CURRENT_DATE - 9, now() + interval '1 day','Second technical round.'),
('Ivana Petrova','Business Analyst','Applied','Career site','Junior','Skopje',1600,'Tamara Petrovska',3, CURRENT_DATE - 2, NULL,'CV review pending.'),
('Damjan Velkovski','Cloud Architect','Screening','Headhunted','Principal','Skopje',5200,'Dragan Sekulovski',5, CURRENT_DATE - 7, now() + interval '3 days','High priority for Global Systems.'),
('Tea Markovska','UX Designer','Interview','Dribbble','Mid','Ohrid',2400,'Tamara Petrovska',4, CURRENT_DATE - 15, now() + interval '5 days','Design challenge submitted.'),
('Filip Ristov','Data Engineer','Hired','Referral','Senior','Skopje',3600,'Dragan Sekulovski',5, CURRENT_DATE - 40, NULL,'Starts next month on BD-DWH-01.'),
('Bojana Stojanovska','Scrum Master','Rejected','Job board','Mid','Skopje',2500,'Tamara Petrovska',2, CURRENT_DATE - 30, NULL,'Not enough delivery experience.'),
('Nikola Angelov','Kotlin Developer','Applied','LinkedIn','Mid','Skopje',2800,'Tamara Petrovska',4, CURRENT_DATE - 1, NULL,'Screening call to schedule.'),
('Emilija Trajkova','Security Engineer','Screening','Conference','Senior','Skopje',3900,'Dragan Sekulovski',4, CURRENT_DATE - 6, now() + interval '6 days','Interested in Alpine Insurance work.'),
('Petar Gjorgjiev','Support Engineer','Offer','Career site','Junior','Bitola',1500,'Dragan Sekulovski',3, CURRENT_DATE - 20, NULL,'Verbal offer accepted.');

INSERT INTO public.activities (company_id, activity_type, subject, body, author, occurred_at)
SELECT c.id, v.atype, v.subject, v.body, v.author, now() - (v.hours || ' hours')::interval
FROM (VALUES
('Meridian Bank','Meeting','Steering committee Q3','Reviewed phase 3 scope and resourcing. CTO happy with velocity.','Marko Jovanovski',48),
('Meridian Bank','Email','Revised estimate sent','Mobile redesign estimate updated after scope reduction.','Ana Petrovska',20),
('Global Systems','Call','Escalation call on MES wave 1','Two milestones slipped. Recovery plan agreed for next sprint.','Ivana Mitrevska',216),
('Global Systems','Note','Renewal risk logged','Framework expires in 75 days, procurement not yet engaged.','Ivana Mitrevska',120),
('FinCore','Meeting','Architecture review','Agreed on event-driven approach for the payments hub extension.','Elena Stojanova',26),
('NovaTech','Email','Order form sent','Three additional engineers from next month.','Nikola Trajkovski',96),
('Adriatic Telecom','Meeting','Tender kick-off','BSS integration tender response due in three weeks.','Stefan Gjorgjiev',6),
('TechVision','Call','Renewal conversation attempt','Left voicemail, no response yet.','Maja Dimitrievska',384),
('KapitalPro','Note','Severity-1 issue still open','Policy portal outage root cause unresolved for 11 days.','Bojan Stefanovski',744),
('Balkan Digital','Email','Invoice reminder','Two invoices overdue beyond 45 days.','Filip Nikolovski',528),
('Northwind Retail','Meeting','Phase two scoping','Checkout replatform scope workshop completed.','Ana Petrovska',120),
('Alpine Insurance','Meeting','Business case review','Claims automation phase 2 business case reviewed with CFO.','Marko Jovanovski',168),
('Danube Pharma','Call','Compliance audit prep','Validation evidence pack required by end of month.','Elena Stojanova',288),
('Vertex Logistics','Email','Final pricing','Sent final pricing for fleet tracking expansion.','Damjan Ristovski',192),
('Helios Energy','Note','Legal review','Framework agreement still with legal, chase next week.','Sara Angelovska',72)
) AS v(company, atype, subject, body, author, hours)
JOIN public.companies c ON c.name = v.company;

INSERT INTO public.tasks (title, company_id, due_date, priority, status, assignee)
SELECT v.title, c.id, CURRENT_DATE + v.days, v.priority, v.status, v.assignee
FROM (VALUES
('Send MSA addendum to legal','Meridian Bank',1,'High','Open','Marko Jovanovski'),
('Prepare MES recovery plan','Global Systems',0,'Urgent','Open','Ivana Mitrevska'),
('Start TechVision renewal','TechVision',2,'High','Open','Maja Dimitrievska'),
('Call KapitalPro sponsor','KapitalPro',-2,'Urgent','Overdue','Bojan Stefanovski'),
('Submit BSS tender response','Adriatic Telecom',14,'High','Open','Stefan Gjorgjiev'),
('Chase Balkan Digital invoices','Balkan Digital',-1,'Normal','Overdue','Filip Nikolovski'),
('Book architecture workshop','FinCore',4,'Normal','Open','Elena Stojanova'),
('Confirm NovaTech order form','NovaTech',3,'Normal','Open','Nikola Trajkovski'),
('Update Northwind phase two estimate','Northwind Retail',6,'Normal','Open','Ana Petrovska'),
('Collect validation evidence pack','Danube Pharma',9,'High','Open','Elena Stojanova')
) AS v(title, company, days, priority, status, assignee)
JOIN public.companies c ON c.name = v.company;

INSERT INTO public.audit_log (actor, action, entity, entity_label, detail, ip_address, created_at) VALUES
('Ana Petrovska','company.update','Company','Northwind Retail','Changed account manager to Ana Petrovska','10.4.12.88', now() - interval '35 minutes'),
('Marko Jovanovski','contract.create','Contract','Core Banking SOW 3','Created statement of work worth €480,000','10.4.12.14', now() - interval '3 hours'),
('System','health.recalculate','Company','KapitalPro','Health score moved 52 to 38','-', now() - interval '5 hours'),
('Ivana Mitrevska','opportunity.stage','Opportunity','MES rollout wave 2','Stage changed Proposal to Negotiation','10.4.12.51', now() - interval '1 day'),
('Dragan Sekulovski','candidate.offer','Candidate','Maja Nikolovska','Offer created at €2,300','10.4.9.203', now() - interval '2 days'),
('Ana Petrovska','role.grant','User','filip.nikolovski@semos.mk','Granted manager role','10.4.12.88', now() - interval '3 days'),
('Elena Stojanova','project.update','Project','DP-VAL-01','Status changed On track to At risk','10.4.12.77', now() - interval '4 days'),
('System','contract.alert','Contract','Framework Agreement 2024','Renewal alert raised, 75 days to expiry','-', now() - interval '5 days'),
('Maja Dimitrievska','activity.create','Activity','TechVision','Logged call attempt','10.4.12.31', now() - interval '6 days'),
('Ana Petrovska','permission.update','Role','Manager','Enabled contract deletion for managers','10.4.12.88', now() - interval '8 days');
