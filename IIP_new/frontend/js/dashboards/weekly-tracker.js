/* ================================================================
   weekly-tracker.js  —  IBM Weekly Closed Cases Tracker  v2.2
   2025: 237 cases / 27 weeks  |  2026: 48 cases / 8 weeks
   2025 rows with comments: 199
   v2.2: Reopened availability category, history export/import/reset,
         dedup guard, auto-history for alert categories, seed history
   ================================================================ */

const _WT_SEED = {
  "2025": {"CW01":[{"id":"TS017989883_CW01","caseNumber":"TS017989883","owner":"Hareesh Gaddam","title":"ALM-14-Q JTS - down due to high heap usage & garbage collection.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"29 days","closedDate":"2025-03-01","comments":"We increased the Heap and Ram Size for LDX server","category":"OOM / App Down","created":"","solutionDate":""}],"CW02":[{"id":"TS017761165_CW02","caseNumber":"TS017761165","owner":"Hareesh Gaddam","title":"ALM-14-P-CCM: The web browser randomly starts to flash and vibrate while using.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"62 days","closedDate":"2025-06-01","comments":"Temporary issue happened. Incase if its happened in future we will be collecting the HAR file and provide it to IBM","category":"","created":"","solutionDate":""},{"id":"TS017835217_CW02","caseNumber":"TS017835217","owner":"Arjunan Malliga","title":"Backup fails on 03-p LQE due to ORA-01013: user requested cancel of current operation","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"53 days","closedDate":"2025-07-01","comments":"Changed the backup and compaction timings post that issue hasnt occured.","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS015972486_CW02","caseNumber":"TS015972486","owner":"Swetha T","title":"DT398597 : ALM-23-P- Error in engine Can not access to the OAuthentication URL","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"270 days","closedDate":"2025-07-01","comments":"After deploying the Testfix issue got resolved","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018014302_CW02","caseNumber":"TS018014302","owner":"Srinivasareddy","title":"[Rollout 7.0.3] Do the \"repotools -verify\" outputs indicated that systems can be updated to 7.0.3 (RM) Production systems","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"29 days","closedDate":"2025-07-01","comments":"Issue is not a blocker for upgrade","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018014241_CW02","caseNumber":"TS018014241","owner":"Srinivasareddy","title":"[Rollout 7.0.3] Do the \"repotools -verify\" outputs indicated that systems can be updated to 7.0.3 (CCM) Production systems","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"29 days","closedDate":"2025-07-01","comments":"Issue is not a blocker for upgrade","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018036224_CW02","caseNumber":"TS018036224","owner":"Imayavarman N J","title":"ALM-13-P_QM Copying Snapshot do not include execution results","customerNumber":"284926","product":"Engineering Test Management","severity":"4","status":"Closed by IBM","age":"27 days","closedDate":"2025-07-01","comments":"Imay will schedule a call with user","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS016280993_CW02","caseNumber":"TS016280993","owner":"Kabelesh K","title":"12P JRS report fails with a timeout","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"232 days","closedDate":"2025-08-01","comments":"I asked user check on this","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS018100898_CW02","caseNumber":"TS018100898","owner":"Hareesh Gaddam","title":"Update of ETM datasources in LQE and LDX is taking hours or days and failing","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"20 days","closedDate":"2025-08-01","comments":"Tried Reindexing post that issue got resolved","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018120405_CW02","caseNumber":"TS018120405","owner":"Srinivasareddy","title":"repotools verify on 14P ends with an error that can block the upgrade to 7.0.3","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"16 days","closedDate":"2025-08-01","comments":"Issue is not a blocker for upgrade","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018121463_CW02","caseNumber":"TS018121463","owner":"Sangavi Devaraj","title":"ALM-20-P QM application down on 23/12 due to high CPU usage.","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"17 days","closedDate":"2025-09-01","comments":"Python scripts caused the issue which was ran from user end","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS017940062_CW02","caseNumber":"TS017940062","owner":"Kabelesh K","title":"ALM-06-P RS - LQE Change set link is missing in the report","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"43 days","closedDate":"2025-10-01","comments":"TRS Feed CCM validation completed","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS017918207_CW02","caseNumber":"TS017918207","owner":"Asha S","title":"Standalone Liberty installation for 7.0.3","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"45 days","closedDate":"2025-10-01","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""}],"CW03":[{"id":"TS015510086_CW03","caseNumber":"TS015510086","owner":"Abdulsalam Nagoor","title":"Configuring UCD agent as service in RHEL9 results in error \"ucdagent.service is not a native service, redirecting to systemd-sysv-install.\"","customerNumber":"284926","product":"DevOps Deploy","severity":"4","status":"Closed by IBM","age":"327 days","closedDate":"2025-01-13","comments":"","category":"Liberty / IHS","created":"","solutionDate":""},{"id":"TS017943600_CW03","caseNumber":"TS017943600","owner":"Sangavi Devaraj","title":"Queries on the external Storage for storing attachments","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"47 days","closedDate":"2025-01-14","comments":"It's handled by artifactory team. Not required from our end.","category":"","created":"","solutionDate":""},{"id":"TS017828108_CW03","caseNumber":"TS017828108","owner":"Sangavi Devaraj","title":"20P Open attachments added quickly before outage fails with error 403","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"61 days","closedDate":"2025-01-14","comments":"Removed the duplicates using a different tool Plain Java API's","category":"","created":"","solutionDate":""},{"id":"TS016564030_CW03","caseNumber":"TS016564030","owner":"Swetha T","title":"ALM-23-P-QM Print Summary of TCR 242264 fails (\"An uncaught error must have occurred during execution.\")","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"204 days","closedDate":"2025-01-15","comments":"Customer handled case where user said \"As we are able to resolve the issue in 23-q server, and if there is possibility of  re-opening the case ( if its not worked in 23-P ), at the moment the case can be closed.\"","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018055763_CW03","caseNumber":"TS018055763","owner":"Arjunan Malliga","title":"ALM-02-T1 Change set delivery from stream to stream.","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"33 days","closedDate":"2025-01-15","comments":"Closed as already we have an existing case TS017958193","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018193209_CW03","caseNumber":"TS018193209","owner":"Asha S","title":"Reg 8.0.0.0-iFix032 LDX build id mismatch","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"9 days","closedDate":"2025-01-16","comments":"","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018091377_CW03","caseNumber":"TS018091377","owner":"Swetha T","title":"ALM-07-P RM-Out of memory issue","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"29 days","closedDate":"2025-01-16","comments":"Increased CPU and Heap RM","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018091430_CW03","caseNumber":"TS018091430","owner":"Imayavarman N J","title":"ALM-13-P_QM support to verify Jira link in DB","customerNumber":"284926","product":"Engineering Test Management","severity":"4","status":"Closed by IBM","age":"29 days","closedDate":"2025-01-16","comments":"IBM has given the query and found that there is not jira link in the DB.","category":"Query / General","created":"","solutionDate":""},{"id":"TS018192444_CW03","caseNumber":"TS018192444","owner":"Kabelesh K","title":"Need clarification on ProcDump Tool","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"4","status":"Closed by Client","age":"10 days","closedDate":"2025-01-17","comments":"ProDump Toll we dont use often for collectings for IBM Investigation","category":"Query / General","created":"","solutionDate":""},{"id":"TS018070140_CW03","caseNumber":"TS018070140","owner":"Asha S","title":"Error CWWKE1200W when starting the Liberty server","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"32 days","closedDate":"2025-01-17","comments":"","category":"Liberty / IHS","created":"","solutionDate":""}],"CW04":[{"id":"TS018072259_CW04","caseNumber":"TS018072259","owner":"Hareesh Gaddam","title":"ALM-14-P: RS application went down","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"35 days","closedDate":"2025-01-20","comments":"Updated the property (To prevent the issue form reoccurring you can increase them to:\r\nhttp.max.connections.route=500\r\nhttp.max.connections.total=1000) for RS Application in RTC and the Server","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS016937980_CW04","caseNumber":"TS016937980","owner":"Imayavarman N J","title":"[DT239524] RQM export is working but it is taking longer than expected in ALM-13-P","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"165 days","closedDate":"2025-01-21","comments":"Issue will be fixed in 7.0.2 (iFix032) or 7.0.3 (Fix011)","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018214252_CW04","caseNumber":"TS018214252","owner":"Kabelesh K","title":"[06-Q][06-P]Change Planned For from unnasigned fails with NullPointerException","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"12 days","closedDate":"2025-01-21","comments":"After uninstalling debug provide in this case TS016540146 issue got fixed","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018150940_CW04","caseNumber":"TS018150940","owner":"Hareesh Gaddam","title":"[DT420549] Reindex fails with \"The following record was not found in the database: com.ibm.rqm.history.common.model.impl.TrsBasePageHandleImpl\"","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"22 days","closedDate":"2025-01-21","comments":"It will be fixed in 7.0.2 ifix033 or 7.0.3 IFix013","category":"TRS Validation","created":"","solutionDate":""},{"id":"TS018295916_CW04","caseNumber":"TS018295916","owner":"Kabelesh K","title":"ALM-06-P CCM - Unable to update â€œPlanned Forâ€ and save work item","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"2 days","closedDate":"2025-01-22","comments":"Post removal of debug on 6-p issue resolved","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018127772_CW04","caseNumber":"TS018127772","owner":"Sangavi Devaraj","title":"ALM-20-P LQE compaction failed with CRLQE1288E Compaction failed to rename the existing index directory","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"30 days","closedDate":"2025-01-23","comments":"Increased heap for LQE 230GB to 280GB","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS017912078_CW04","caseNumber":"TS017912078","owner":"Imayavarman N J","title":"[13-P ETM] Deleted Requirement link returns after save ex: TS012203369","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by Client","age":"59 days","closedDate":"2025-01-23","comments":"Affected project area was archived","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018033892_CW04","caseNumber":"TS018033892","owner":"Sandeep Yashoda","title":"ALM-20-P-GC Diagnostics Error","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by Client","age":"43 days","closedDate":"2025-01-23","comments":"IBM provided work around sandeep will check with user and do the repotool reindex in future","category":"TRS Validation","created":"","solutionDate":""},{"id":"TS018237988_CW04","caseNumber":"TS018237988","owner":"Kabelesh K","title":"ALM-12-P LQE - JTS Link Validity Resources (TRS 2.0) failed with Rollback Detected","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"11 days","closedDate":"2025-01-24","comments":"Reopen","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS016707569_CW04","caseNumber":"TS016707569","owner":"Sandeep Yashoda","title":"ALM-20-P-CCM Timeout Authentication error with GitGerrit","customerNumber":"284926","product":"Engineering Workflow Management","severity":"4","status":"Closed by Client","age":"197 days","closedDate":"2025-01-24","comments":"Changed the timeout settings in client using application not on ALM","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018305059_CW04","caseNumber":"TS018305059","owner":"Srinivasareddy","title":"ALM 07P: JRS reports do not contain base artifact links","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"3 days","closedDate":"2025-01-24","comments":"TRS Feed validation in RM Specific configuration + Datasource reindexing in RM","category":"LQE / LDX","created":"","solutionDate":""}],"CW05":[{"id":"TS017990513_CW05","caseNumber":"TS017990513","owner":"Sandeep Yashoda","title":"ALM-20-P RTC Widgets not displaying URLs","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"53 days","closedDate":"2025-01-27","comments":"JTS and CCM -> in advance properties -> Click jacking allow list","category":"","created":"","solutionDate":""},{"id":"TS018316497_CW05","caseNumber":"TS018316497","owner":"Hareesh Gaddam","title":"ALM-14-P-CCM:  Need information on server performance impact","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"5 days","closedDate":"2025-01-27","comments":"Planning to automate the release creation process","category":"Performance / Slow","created":"","solutionDate":""},{"id":"TS016290980_CW05","caseNumber":"TS016290980","owner":"Swetha T","title":"DT398598 [23-P] Limit by Lifecycle Status: Failed does not show artifacts linked to Failed Test Cases","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by Client","age":"251 days","closedDate":"2025-01-28","comments":"Issue will be fixed in 7.0.3","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS017870696_CW05","caseNumber":"TS017870696","owner":"Swetha T","title":"ALM-23-Q RM: TRS Feed validation has been failed","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"69 days","closedDate":"2025-01-28","comments":"Issue got fixed in ifix032","category":"TRS Validation","created":"","solutionDate":""},{"id":"TS018326423_CW05","caseNumber":"TS018326423","owner":"Kabelesh K","title":"ALM-06-P RM - Primary text and title of that particular artifact is not updating","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"6 days","closedDate":"2025-01-29","comments":"The Primary Text and the Name (or Title) of an artifact are typically separate fields. Editing one does not automatically update the other. When you create a new artifact, the Name and Primary Text fields are the same by default. However, after the artifact is created, you can independently edit the Name field as needed. Please refer the screenshot shared below","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS016905259_CW05","caseNumber":"TS016905259","owner":"Arjunan Malliga","title":"ALM-03-P-CCM Stack over flow error.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"177 days","closedDate":"2025-01-29","comments":"After removing the cyclic dependencies from the work items, the plan started functioning as expected.","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018103136_CW05","caseNumber":"TS018103136","owner":"Saharikaa S S","title":"Unable to generate javadumps manually (gets hung) to analyse performance issue","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"42 days","closedDate":"2025-01-29","comments":"","category":"Performance / Slow","created":"","solutionDate":""}],"CW06":[{"id":"TS017940497_CW06","caseNumber":"TS017940497","owner":"Saharikaa S S","title":"It takes longer to start for the apps in 7.0.3","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"2","status":"Closed by IBM","age":"67 days","closedDate":"2025-03-02","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018282199_CW06","caseNumber":"TS018282199","owner":"Kabelesh K","title":"ALM-06-P DW - Showing wrong status in Report using Datawarehouse","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"18 days","closedDate":"2025-03-02","comments":"Post Running Delta Load issue got fixed","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS017919665_CW06","caseNumber":"TS017919665","owner":"Swetha T","title":"ALM-19-P -Open social gadget widget is not working in RM","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"70 days","closedDate":"2025-03-02","comments":"Temporary issue which happened due to network connectivity. Post restart of RM issue got fixed","category":"","created":"","solutionDate":""},{"id":"TS018270731_CW06","caseNumber":"TS018270731","owner":"Asha S","title":"[DT422098]JTS registered applications page for RS shows 7.0.3 ifix012","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"20 days","closedDate":"2025-05-02","comments":"","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018240432_CW06","caseNumber":"TS018240432","owner":"Imayavarman N J","title":"[Rollout 7.0.3] Executing repotools offline verify with level 5 failed for 11-D_CCM application","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"24 days","closedDate":"2025-06-02","comments":"We can ignore the errors as there is no blocker","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018150805_CW06","caseNumber":"TS018150805","owner":"Sandeep","title":"ALM-20-Q QM what was the reason of OOME noticed on Friday 2024-12-14 at 14:00","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"39 days","closedDate":"2025-07-02","comments":"Python scripts caused the issue which was ran from user end","category":"OOM / App Down","created":"","solutionDate":""}],"CW07":[{"id":"TS018339072_CW07","caseNumber":"TS018339072","owner":"Sandeep Yashoda","title":"ALM-01-tf-ETM - Update of ETM data source takes 20 days","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"17 days","closedDate":"2025-10-02","comments":"It took 20days to update 130k resources","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS017803651_CW07","caseNumber":"TS017803651","owner":"Maheswaran Murugesan","title":"Server Rename Fails for CCM and RM2 application | ALM-06-T2","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"2","status":"Closed by IBM","age":"90 days","closedDate":"2025-10-02","comments":"","category":"","created":"","solutionDate":""},{"id":"TS018443229_CW07","caseNumber":"TS018443229","owner":"Sangavi Devaraj","title":"Project area rename issue in ALM-25-Q CCM","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"5 days","closedDate":"2025-11-02","comments":"It'll be fixed in 7.1 and 7.0.3 ifix003","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018174036_CW07","caseNumber":"TS018174036","owner":"Saharikaa S S","title":"Exception thrown and logged during a server shutdown if listeners timeout during quiesce","customerNumber":"881812","product":"WebSphere Application Server","severity":"3","status":"Closed by IBM","age":"41 days","closedDate":"2025-02-13","comments":"","category":"Performance / Slow","created":"","solutionDate":""},{"id":"TS017196457_CW07","caseNumber":"TS017196457","owner":"Sandeep Yashoda","title":"API calls are slow in specific DNG project areas in ALM-20-P-DNG","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"156 days","closedDate":"2025-02-13","comments":"We have did workarounds, IBM requested for must gathers but issue is not reproduceable as its occuring periodically. Its happening only in 1 or 2 PA's","category":"DNG / RM","created":"","solutionDate":""}],"CW08":[{"id":"TS018511931_CW08","caseNumber":"TS018511931","owner":"Swetha T","title":"ALM: Set \"Modules\" as the Default Selection for Creating Links in DOORS Next","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"4","status":"Closed by IBM","age":"3 days","closedDate":"2025-02-17","comments":"Swetha will raise RFE","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS017939560_CW08","caseNumber":"TS017939560","owner":"Imayavarman N J","title":"ALM-13 Quality Management Facts DCC Job fails for both P & Q","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"82 days","closedDate":"2025-02-18","comments":"TRUNCATE TABLE RIDW.F_EXECRESPOINTS_METRICS --> Post this issue got resolved and dcc jobs failure fixed","category":"","created":"","solutionDate":""},{"id":"TS016895497_CW08","caseNumber":"TS016895497","owner":"Saharikaa S S","title":"Repotools JTS setup failed while registering qm2 application","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"197 days","closedDate":"2025-02-18","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018412345_CW08","caseNumber":"TS018412345","owner":"Hareesh Gaddam","title":"ALM-14-P-RM : XC-CE specific Module explorer widget is not working","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"15 days","closedDate":"2025-02-18","comments":"https://www.ibm.com/support/pages/node/6466981 - Temporary issue","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS014658473_CW08","caseNumber":"TS014658473","owner":"Sandeep Yashoda","title":"ALM-20-D-DNG:Cloning a module results in\"unexpected exception\"","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"470 days","closedDate":"2025-02-19","comments":"Permission issue","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018442699_CW08","caseNumber":"TS018442699","owner":"Kabelesh K","title":"ALM-06-P QM Test Case returns back to Test Plan after removing and saving it","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by Client","age":"14 days","closedDate":"2025-02-19","comments":"This problem is caused by Known Issue DT419642. A fix will be available as part of 7.0.2 iFix33 and this issue is fixed in 7.0.3 iFix13","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018501890_CW08","caseNumber":"TS018501890","owner":"Kabelesh K","title":"ALM-25-P - Query on implementing reports in third party tools","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"4","status":"Closed by Client","age":"7 days","closedDate":"2025-02-19","comments":"IBM does not have any integration to Confluence, but I believe that an IBM Business partner \"Sodius-Willert\" has a solution that does integrate ELM and Confluence.","category":"Query / General","created":"","solutionDate":""},{"id":"TS018225875_CW08","caseNumber":"TS018225875","owner":"Swetha T","title":"ALM-25-P-DNG module export (report as Word or PDF) taking too long","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"41 days","closedDate":"2025-02-20","comments":"New case raised for automating the DNG Export from cutsomer end - TS018529451","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018431914_CW08","caseNumber":"TS018431914","owner":"Swetha T","title":"ALM-25-P-QM TPT and ALM connection issue","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"15 days","closedDate":"2025-02-20","comments":"No reply from user end leads to case closure","category":"ETM / QM","created":"","solutionDate":""}],"CW09":[{"id":"TS017750798_CW09","caseNumber":"TS017750798","owner":"Kabelesh K","title":"ALM-12-Q JRS - Report Request Timeout with HTTP/1.1 408","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"111 days","closedDate":"2025-02-24","comments":"Reopened by Paul","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS018383012_CW09","caseNumber":"TS018383012","owner":"Kabelesh K","title":"ALM-06-P RS - Datawarehouse Report Getting failed due to timeout","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"25 days","closedDate":"2025-02-24","comments":"IBM suggested to increase timeout whereas customer contact was not ready to accept as they want the user to optimize the query","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS018529451_CW09","caseNumber":"TS018529451","owner":"Swetha T","title":"Automating Module Export in RDNG","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"4","status":"Closed by IBM","age":"9 days","closedDate":"2025-02-25","comments":"Customer replied \"thank you for your helpful information, I will study and try to implement a script out of it.\"","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS017815534_CW09","caseNumber":"TS017815534","owner":"Imayavarman N J","title":"ALM-13-Q_LDX Application down with outofmemory exception on 10th Nov 2024","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"2","status":"Closed by IBM","age":"104 days","closedDate":"2025-02-25","comments":"Increased the Heap and Ram in ldx to get datasource uptodate post that heap and ram will be changed to the original value.","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018230125_CW09","caseNumber":"TS018230125","owner":"Sandeep Yashoda","title":"ALM-20-P CCM down on 10-Jan-2025 due to java.lang.OutOfMemoryError: Java heap space","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"47 days","closedDate":"2025-02-26","comments":"Automation scripts needs to be registered - Documentation","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018361781_CW09","caseNumber":"TS018361781","owner":"Arjunan Malliga","title":"ALM-03-P QM Application down due to high heap and garbage usage.","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"29 days","closedDate":"2025-02-26","comments":"No proper details found in the log for bm to investigtae","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS017631578_CW09","caseNumber":"TS017631578","owner":"Srinivasareddy","title":"CCM Skipped resources in ALM production systems","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"129 days","closedDate":"2025-02-27","comments":"IBM suggested to original wi and keep the duplicate","category":"TRS Validation","created":"","solutionDate":""}],"CW10":[{"id":"TS018580131_CW10","caseNumber":"TS018580131","owner":"Sandeep Yashoda","title":"ALM-20-P-CCM Down on 22/Feb/2025","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"9 days","closedDate":"2025-03-03","comments":"Unfortunately user added a issued WI in Automation job. Later we asked user to delete the WI. Provided steps how to remove WI from PA","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018645386_CW10","caseNumber":"TS018645386","owner":"Arjunan Malliga","title":"ALM-02-Q is not accessible after 7.0.3 upgrade.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"0 days","closedDate":"2025-03-03","comments":"DB team enhanced","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018306663_CW10","caseNumber":"TS018306663","owner":"Sandeep Yashoda","title":"ALM-19-P-Unable to connect to Eclipse","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"41 days","closedDate":"2025-03-03","comments":"Old eclipse version used by user, Recently he changed username and password. Asked user to upgrade the eclipse to new version","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS017981814_CW10","caseNumber":"TS017981814","owner":"Hareesh Gaddam","title":"ALM-14-Q-QM : Excel Exports stuck at 0%","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"89 days","closedDate":"2025-03-03","comments":"Issue happend during PA migration, Now user cant abe to reproduce the issue.","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018510363_CW10","caseNumber":"TS018510363","owner":"Arjunan Malliga","title":"ALM DNG Application Enhancement Request: Export file name should Match View Name.","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"4","status":"Closed by IBM","age":"18 days","closedDate":"2025-03-03","comments":"RFE created","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018647829_CW10","caseNumber":"TS018647829","owner":"Abdulsalam Nagoor","title":"Upgrading ATS 9.2.X for ELM causes csrf vulnerability","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"1 day","closedDate":"2025-04-03","comments":"","category":"","created":"","solutionDate":""},{"id":"TS018382984_CW10","caseNumber":"TS018382984","owner":"Kabelesh K","title":"ALM-06-P RS - Data mismatch for planned for field in Report builder using Datawarehouse","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"34 days","closedDate":"2025-05-03","comments":"Data was not updated in the DW and that is why the report was showing stale data. After we ran the DCC jobs, the issue was resolved","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS018512785_CW10","caseNumber":"TS018512785","owner":"Sandeep Yashoda","title":"ALM-20-P-RQM Inconsistent states of Test cases that were updated using a custom tool (in 2023)","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by Client","age":"20 days","closedDate":"2025-06-03","comments":"No further investigation needed as they're using this test cases","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018500589_CW10","caseNumber":"TS018500589","owner":"Imayavarman N J","title":"ALM-05P: Req-IF export is slow","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"21 days","closedDate":"2025-06-03","comments":"","category":"Performance / Slow","created":"","solutionDate":""},{"id":"TS018101982_CW10","caseNumber":"TS018101982","owner":"Srinivasareddy","title":"repotools -verify result in \"CRJAZ1150E The repository was not verified: Queryable tables have data issues\"","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"77 days","closedDate":"2025-06-03","comments":"Raised to check prerequiste of 7.0.3","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018570193_CW10","caseNumber":"TS018570193","owner":"Abdulsalam Nagoor","title":"How to handle vary headers in IBM httpd server","customerNumber":"881812","product":"WebSphere Application Server","severity":"2","status":"Closed by IBM","age":"14 days","closedDate":"2025-07-03","comments":"","category":"Query / General","created":"","solutionDate":""}],"CW11":[{"id":"TS018326513_CW11","caseNumber":"TS018326513","owner":"Srinivasareddy","title":"Investigate& optimize the repotools -verify command execution duration","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"46 days","closedDate":"2025-10-03","comments":"We created RFE and IBM also escalated this","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018070796_CW11","caseNumber":"TS018070796","owner":"Sandeep Yashoda","title":"ALM-LQE RS Clarifications on backup, compaction and report conversion","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"85 days","closedDate":"2025-11-03","comments":"Will be reopen","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018691436_CW11","caseNumber":"TS018691436","owner":"Sandeep Yashoda","title":"ALM-01-TF- LQERS issues","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"4 days","closedDate":"2025-11-03","comments":"closed","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018718260_CW11","caseNumber":"TS018718260","owner":"Sandeep Yashoda","title":"ALM-01-TE-LQERS issues","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"0 days","closedDate":"2025-11-03","comments":"Closed","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018561944_CW11","caseNumber":"TS018561944","owner":"Asha S","title":"Standalone liberty Vs Traditional liberty","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"20 days","closedDate":"2025-12-03","comments":"","category":"Liberty / IHS","created":"","solutionDate":""},{"id":"TS018678422_CW11","caseNumber":"TS018678422","owner":"Sandeep Yashoda","title":"ALM-20-Q JTS System Down on 06/3/2025","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"7 days","closedDate":"2025-03-13","comments":"Enhanced the Diskspace","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018098521_CW11","caseNumber":"TS018098521","owner":"Swetha T","title":"ALM-25-P CCM-Sprint backlog plan cannot be opened in some project areas","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"84 days","closedDate":"2025-03-13","comments":"","category":"","created":"","solutionDate":""},{"id":"TS018621851_CW11","caseNumber":"TS018621851","owner":"Srinivasareddy","title":"ALM-07-P: JRS reports does not return any results.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"14 days","closedDate":"2025-03-13","comments":"Once they're project scope for the user, Issue got resolved","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS017750798_CW11","caseNumber":"TS017750798","owner":"Kabelesh K","title":"ALM-12-Q JRS - Report Request Timeout with HTTP/1.1 408","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"129 days","closedDate":"2025-03-14","comments":"In LQE we set connection timeout to 300 and socket timeout to 900 and post that the report finished within 45 mins","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018631847_CW11","caseNumber":"TS018631847","owner":"Srinivasareddy","title":"7.0.3 upgrade - 05Q - \"Could not create JVM\" (JVMJ9VM015W) during the repotools-ccm.bat -migration_CCM_updateConfiguration execution","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"14 days","closedDate":"2025-03-14","comments":"Decreased reprotool mx heapsize in script and then in worked","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018352629_CW11","caseNumber":"TS018352629","owner":"Srinivasareddy","title":"[Rollout 7.0.3] Repotools-rm computeChangesetDependencies issue during 7.0.3 upgrade","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"46 days","closedDate":"2025-03-14","comments":"7.0.3 prerequiste case and check with IBM, they told to ignore this","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018501879_CW11","caseNumber":"TS018501879","owner":"Hareesh Gaddam","title":"ALM: Additional option required while creating baseline","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"4","status":"Closed by IBM","age":"29 days","closedDate":"2025-03-14","comments":"RFE","category":"","created":"","solutionDate":""}],"CW12":[{"id":"TS018717517_CW12","caseNumber":"TS018717517","owner":"Sangavi Devaraj","title":"How to generate notifications in MS teams for work item due dates","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"6 days","closedDate":"2025-03-17","comments":"IBM has provided 3 documents","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018070796_CW12","caseNumber":"TS018070796","owner":"Sandeep Yashoda","title":"ALM-LQE RS Clarifications on backup, compaction and report conversion","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"91 days","closedDate":"2025-03-17","comments":"IBM has provided the clarification and documents those in wiki","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018316213_CW12","caseNumber":"TS018316213","owner":"Sandeep Yashoda","title":"ALM-20-Q-JRS Meta model Refresh fails with \"Could not connect to data source\" error","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"54 days","closedDate":"2025-03-17","comments":"Ibm suggested to unregister and register in the JTS but we havent performed. We upgraded to 7.0.3 post that issue got fixed","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018502716_CW12","caseNumber":"TS018502716","owner":"Imayavarman N J","title":"History for DNG Views - Creation/Modification/Deletion","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"4","status":"Closed by Client","age":"33 days","closedDate":"2025-03-18","comments":"RFE","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018584587_CW12","caseNumber":"TS018584587","owner":"Abdulsalam Nagoor","title":"Invalid redirect_uri thrown by JAS after Apache Traffic Server update","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"2","status":"Closed by IBM","age":"22 days","closedDate":"2025-03-18","comments":"","category":"","created":"","solutionDate":""},{"id":"TS018183680_CW12","caseNumber":"TS018183680","owner":"Kabelesh K","title":"ALM-06-P CCM - Application went down, error java.lang.OutOfMemoryError: Java heap space","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"71 days","closedDate":"2025-03-18","comments":"The issue stemmed from heavy memory usage by WI export/import operations, especially through the CSVSerializerService & Avoid large WI exports that coincide with high-memory-demand operations like reindexing.","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018678296_CW12","caseNumber":"TS018678296","owner":"Hareesh Gaddam","title":"ALM-14-P-DCC : Requirement management job for DOORS9 resource group is running for 30+ hours instead of the usual 16-19 hours","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"12 days","closedDate":"2025-03-18","comments":"Issue is not occuring again to enbale ibm provided loggers to find root cause","category":"","created":"","solutionDate":""},{"id":"TS018631731_CW12","caseNumber":"TS018631731","owner":"Srinivasareddy","title":"7.0.3 upgrade - 14Q - \"Could not create JVM\" (JVMJ9VM015W) during the JTS_upgrade.bat execution","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"19 days","closedDate":"2025-03-19","comments":"Decreased reprotool mx heapsize in script and then in worked","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018775255_CW12","caseNumber":"TS018775255","owner":"Srinivasareddy","title":"JRS missing feature in 7.0.3","customerNumber":"284926","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"3 days","closedDate":"2025-03-20","comments":"Issue will resolve only in LQERS as this feature available in LQERS","category":"LQE / LDX","created":"","solutionDate":""}],"CW13":[{"id":"TS018611120_CW13","caseNumber":"TS018611120","owner":"Sandeep Yashoda","title":"ALM-20-P-Dcc  Change and Configuration Management workitem jobs failed with java.util.concurrent.ExecutionException","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"26 days","closedDate":"2025-03-24","comments":"Initially dcc jobs runs for every 15mins, IBM suggested to keep for every 1 hour. Yet implement this as discussion ongoing with customer","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018788801_CW13","caseNumber":"TS018788801","owner":"Shameera Fairoz Shajahan","title":"Steps for creating a new datawarehouse for lqe relational store","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"7 days","closedDate":"2025-03-24","comments":"","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS017931753_CW13","caseNumber":"TS017931753","owner":"Arjunan Malliga","title":"ALM-01-P, what will be the he impact of changing the default limitation to more than 2000 characters for rebuildTextIndices?","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"118 days","closedDate":"2025-03-25","comments":"IBM provided technote as we dont have any such wi to test it.","category":"","created":"","solutionDate":""},{"id":"TS018501870_CW13","caseNumber":"TS018501870","owner":"Srinivasareddy","title":"Search by Keyword or WORK item Number\" doesn't show all the workitems","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"41 days","closedDate":"2025-03-26","comments":"RFE","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018820052_CW13","caseNumber":"TS018820052","owner":"Hareesh Gaddam","title":"DNG Exports not working even after 14-15 hours","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"5 days","closedDate":"2025-03-26","comments":"we have already existing case is there for 14-P-DNG exports issue TS017472133.","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018715275_CW13","caseNumber":"TS018715275","owner":"Hareesh Gaddam","title":"ALM-14-P links_ccm data source in LDX failed with RollbackDetectedException","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"15 days","closedDate":"2025-03-26","comments":"For this error reindexing is the solution","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018690965_CW13","caseNumber":"TS018690965","owner":"Swetha T","title":"ALM-23-P RQM: Delay in execution of test  cases","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"20 days","closedDate":"2025-03-27","comments":"Customer case - The issue has been resolved from the user end","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018201997_CW13","caseNumber":"TS018201997","owner":"Swetha T","title":"ALM-23-ETM - what is the root cause of frequently (25.01.07, 25.01.09, 25.01.19) observed OOMEs","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"78 days","closedDate":"2025-03-27","comments":"Maximum attachment size proper is 90 in Qm but whereas user tried uploading a mp4 video which mre than 90MB which cause the oom","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018484263_CW13","caseNumber":"TS018484263","owner":"Mohan Raj Jaganathan","title":"Add support for Kerberos like EWM Eclipse Client when JAS is in use","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"45 days","closedDate":"2025-03-28","comments":"","category":"","created":"","solutionDate":""},{"id":"TS017083309_CW13","caseNumber":"TS017083309","owner":"Hareesh Gaddam","title":"14 P LQE Report showing literal instead of enumeration value for some CM artifacts.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"212 days","closedDate":"2025-03-28","comments":"Issue got auto resolved but IBM suggested to install a third party tool called Fuseki to search the index.","category":"LQE / LDX","created":"","solutionDate":""}],"CW14":[{"id":"TS016540146_CW14","caseNumber":"TS016540146","owner":"Kabelesh K","title":"In ALM-28-P CCM, saving a wokitem fails a staledata error.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"283 days","closedDate":"2025-03-31","comments":"Re-opened","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018690201_CW14","caseNumber":"TS018690201","owner":"Arjunan Malliga","title":"ALM-03-P RM Project area cant able to deliver the change sets.","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"24 days","closedDate":"2025-03-31","comments":"Some user modified the artificat which cause the change sets not to deliver and also now its not reproducible","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018715440_CW14","caseNumber":"TS018715440","owner":"Sangavi Devaraj","title":"LQE Report with Historical trends in ALM-20-P","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"21 days","closedDate":"2025-03-31","comments":"Customer testing in q systems. For P system its on hold as performance issue will occur.","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018386483_CW14","caseNumber":"TS018386483","owner":"Hareesh Gaddam","title":"ALM-14-Q Reports using LQE using configurations data source shows no results","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"61 days","closedDate":"2025-01-04","comments":"Temporary issue and user also not properly responded.","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018046530_CW14","caseNumber":"TS018046530","owner":"Sangavi Devaraj","title":"\"Unexpected JWT issuer\" error while trying to establish Friendship connection between ALM and Pure Variants","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"110 days","closedDate":"2025-01-04","comments":"06-q and 02-t3 program created by martin to implement this","category":"","created":"","solutionDate":""},{"id":"TS018584854_CW14","caseNumber":"TS018584854","owner":"Kabelesh K","title":"[7.0.3] - DNG - Check and repair \"unwanted artifact updates\" from ReqIF import issue","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"36 days","closedDate":"2025-01-04","comments":"Re-opened","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018820068_CW14","caseNumber":"TS018820068","owner":"Hareesh Gaddam","title":"Inconsistent JRS reports","customerNumber":"284926","product":"Engineering Lifecycle Management Base","severity":"2","status":"Closed by IBM","age":"11 days","closedDate":"2025-01-04","comments":"IBM splitted the case eventhough its not required","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS018867981_CW14","caseNumber":"TS018867981","owner":"Srinivasareddy","title":"Icons issue in project dashboard for AM & CCM applications on 11q after 7.0.3","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"6 days","closedDate":"2025-02-04","comments":"Issue will resolve in 7.1 & as of now IBM provide temporary workaround","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018912169_CW14","caseNumber":"TS018912169","owner":"Srinivasareddy","title":"ALM-07-P Meta model refresh failed with CRRGW5503E An unexpected response was received from the data source: HTTP/1.1 503 Service Unavailable","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"1 day","closedDate":"2025-03-04","comments":"The meta model refresh failed because the LQE compaction was running.","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018495367_CW14","caseNumber":"TS018495367","owner":"Sangavi Devaraj","title":"ALM-20-P \"Planned Feature w/o Acceptance criteria\" widget shows \"Unable to display requested data.\" error","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"51 days","closedDate":"2025-04-04","comments":"it got resolved automatically and IBM told they could not check further since there were not javacores for the requested time..","category":"","created":"","solutionDate":""},{"id":"TS014097909_CW14","caseNumber":"TS014097909","owner":"Srinivasareddy","title":"[11-p] Full DCC job for requirements hangs","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"576 days","closedDate":"2025-04-04","comments":"Installed multiple patched and delta load ran from when case got create 1 year","category":"","created":"","solutionDate":""},{"id":"TS018750539_CW14","caseNumber":"TS018750539","owner":"Srinivasareddy","title":"11-P - DCC delta load reports 4 java.lang.NullPointerException warnings","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"21 days","closedDate":"2025-04-04","comments":"Installed multiple patched and delta load ran from when case got create 1 year","category":"","created":"","solutionDate":""},{"id":"TS018787793_CW14","caseNumber":"TS018787793","owner":"Srinivasareddy","title":"Drag and drop a plan to another plan in EWM does not work in 7.0.3","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"17 days","closedDate":"2025-04-04","comments":"Created RFE(https://ideas.ibm.com/ideas/ENGEWM-I-675)","category":"Upgrade / Rollout","created":"","solutionDate":""}],"CW15":[{"id":"TS018681243_CW15","caseNumber":"TS018681243","owner":"Pavithra Shree Mathivanan","title":"What is the cause of the log message ERROR com.ibm.team.jis.lqe.AppInitializer LQE and LDX applications after 7.1.0 upgrade","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"32 days","closedDate":"2025-07-04","comments":"","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018738530_CW15","caseNumber":"TS018738530","owner":"Arjunan Malliga","title":"ALM-03-P-RM Change set got modified.","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"26 days","closedDate":"2025-08-04","comments":"Access.log got over written as we dont have this in splunk for long suration and Not able to find the user as its a service account","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018631655_CW15","caseNumber":"TS018631655","owner":"Saharikaa S S","title":"\"The new user could not be created... ID CRJAZ1551\" when running repotools JTS setup","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"4","status":"Closed by IBM","age":"39 days","closedDate":"2025-08-04","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS017862388_CW15","caseNumber":"TS017862388","owner":"Kabelesh K","title":"[KI DT396715] ALM-12-Q RM - Link is not visible post linking ccm,qm to rm","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"140 days","closedDate":"2025-08-04","comments":"User handled case","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018949227_CW15","caseNumber":"TS018949227","owner":"Srinivasareddy","title":"issue with oslc links for projects in ALM-14","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"1 day","closedDate":"2025-08-04","comments":"User selected wrong configuration and IBM rectified it","category":"","created":"","solutionDate":""},{"id":"TS018906103_CW15","caseNumber":"TS018906103","owner":"Hareesh Gadam","title":"Requirement Management DCC job is failing in ALM-14-P-DCC","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"8 days","closedDate":"2025-09-04","comments":"Dwa user left from bosch so it got failed. Later connected with dwa and changed the password","category":"","created":"","solutionDate":""},{"id":"TS018951271_CW15","caseNumber":"TS018951271","owner":"Srinivasareddy","title":"Set role-based permissions to restrict moving a work item out of a project area not working","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"3 days","closedDate":"2025-10-04","comments":"Query: Without permission also user can remove the project area which he created.","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS017872398_CW15","caseNumber":"TS017872398","owner":"Sandeep Yashoda","title":"ALM-20-P-DNG DCC Job 'Requirements Management' takes a long time to run and gets cancelled.","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"141 days","closedDate":"2025-10-04","comments":"Next week this case will be re-open","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018444149_CW15","caseNumber":"TS018444149","owner":"Swetha T","title":"ALM-25-P-RM module export template deployment","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"64 days","closedDate":"2025-11-04","comments":"Customer handled case","category":"DNG / RM","created":"","solutionDate":""}],"CW16":[{"id":"TS018811028_CW16","caseNumber":"TS018811028","owner":"Maheswaran Murugesan","title":"ALM06P2 | often the session in database got blocked","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"2","status":"Closed by IBM","age":"25 days","closedDate":"2025-04-14","comments":"","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018868621_CW16","caseNumber":"TS018868621","owner":"Hareesh Gaddam","title":"ALM-14-Q-LQE, ETM Datasource got failed \"CRLQE0490E Truncated change log detected.\"","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"18 days","closedDate":"2025-04-14","comments":"After 7.0.3 OSLC migration dueto heavy load, Validation didnt help and post that reindexing triggered and issue got fixed","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019020433_CW16","caseNumber":"TS019020433","owner":"Hareesh Gaddam","title":"ALM-14-P: Observed slowness in QM application.","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"1 day","closedDate":"2025-04-16","comments":"We faced slowness in Qm but nothing has been recorded in the logs. so ibm cant investigate further","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018681001_CW16","caseNumber":"TS018681001","owner":"Kabelesh K","title":"ALM-06-Q RM - Getting Error while opening Complex sensor project area","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"41 days","closedDate":"2025-04-16","comments":"Customer handled case","category":"","created":"","solutionDate":""},{"id":"TS018350957_CW16","caseNumber":"TS018350957","owner":"Sandeep Yashoda","title":"ALM-20-P-CCM Jira dahsboard within an External Content widget is not loading","customerNumber":"284926","product":"Engineering Workflow Management","severity":"4","status":"Closed by Client","age":"79 days","closedDate":"2025-04-16","comments":"Issue with Jira and IBM suggested to check Jira team. Post change of url from Jira team issue resolved","category":"","created":"","solutionDate":""},{"id":"TS018631557_CW16","caseNumber":"TS018631557","owner":"Sangavi Devaraj","title":"To know the LQE datasource reindexing timings","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"48 days","closedDate":"2025-04-17","comments":"To know the LQE and LDX Mbeans only we created this case.","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS017958193_CW16","caseNumber":"TS017958193","owner":"Arjunan Malliga","title":"ALM-02-T1 RM Changeset delivery is stuck calculating dependencies and uses all heap space","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"136 days","closedDate":"2025-04-17","comments":"User informed like they'll test this with 11-q system. So, they dropped the plan to test with 02-t1","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018644923_CW16","caseNumber":"TS018644923","owner":"Harshitha Nalukurthi","title":"ALM-25-Q many OSLC-QM-Service requests in QM causing the environment unresponsive","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"46 days","closedDate":"2025-04-18","comments":"IBM opened a dedicated case for this - TS019010963","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018586960_CW16","caseNumber":"TS018586960","owner":"Imayavarman N J","title":"[DT434367] ALM-13-Q Node 2 & 4 Getting down.","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"53 days","closedDate":"2025-04-18","comments":"IBM Suggested to increased heapsize as per IBM documentaion it must be RAM/2","category":"Defect / iFix","created":"","solutionDate":""}],"CW17":[{"id":"TS018678111_CW17","caseNumber":"TS018678111","owner":"Hareesh Gaddam","title":"ALM-14-Q: ETM OSLC migration takes over a week after upgrade to 7.0.3","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"46 days","closedDate":"2025-04-21","comments":"IBM has provided testfix, post applying it process progressed faster.","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS013882770_CW17","caseNumber":"TS013882770","owner":"Sandeep Yashoda","title":"MAT for DNG Module Structural issues","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"617 days","closedDate":"2025-04-22","comments":"Reopen","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS018960232_CW17","caseNumber":"TS018960232","owner":"Arjunan Malliga","title":"ALM-13-P-LQE Can we delete files created during a failed LQE compaction?","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"4","status":"Closed by IBM","age":"14 days","closedDate":"2025-04-22","comments":"You can delete the old compacted folders while compaction is running but not the current copaction folder","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS017186824_CW17","caseNumber":"TS017186824","owner":"Hareesh Gaddam","title":"Delay in loading the RQM Timelines Page in 14-P","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"225 days","closedDate":"2025-04-23","comments":"After upgarding to 7.0.3 issue got resolved","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS019126059_CW17","caseNumber":"TS019126059","owner":"Sandeep Yashoda","title":"ALM-20-P-Extension of description field on all test artifact in RQM 2","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by Client","age":"2 days","closedDate":"2025-04-24","comments":"IBM suggested its not possible to increase the characters cont in the test case description","category":"ETM / QM","created":"","solutionDate":""},{"id":"TS018811774_CW17","caseNumber":"TS018811774","owner":"Saharikaa S S","title":"\"/ccm\" registration fails with CRJAZ2594E","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"36 days","closedDate":"2025-04-25","comments":"","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018904733_CW17","caseNumber":"TS018904733","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Extra data source for CCM & AM on LDX in 7.0.3","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"24 days","closedDate":"2025-04-25","comments":"","category":"LQE / LDX","created":"","solutionDate":""}],"CW18":[{"id":"TS018960819_CW18","caseNumber":"TS018960819","owner":"Arjunan Malliga","title":"In Alm-03-P CCM, parent of link type is not visible in Report builder.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"20 days","closedDate":"2025-04-28","comments":"We did vocabulary reindex in LQE.","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS015722369_CW18","caseNumber":"TS015722369","owner":"Imayavarman N J","title":"[DT245569] 13P repotoolsFindInvalidLinks skips to identify some Test Cases with invalid requirement links","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"409 days","closedDate":"2025-04-28","comments":"Created another case - TS019168816","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS017002197_CW18","caseNumber":"TS017002197","owner":"Arjunan Malliga","title":"ALM-02-T3 Requirement Management Job Failiure.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"253 days","closedDate":"2025-04-29","comments":"IBM suggested to add missing attributes but customer doesnt want to add as the 02-t3 will be decommissioned by June end","category":"","created":"","solutionDate":""},{"id":"TS019009377_CW18","caseNumber":"TS019009377","owner":"Sangavi Devaraj","title":"Mbeans to check validation times return null values","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"16 days","closedDate":"2025-04-30","comments":"To check how to get the data for LQE and LDX validation and we closed this case","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018818909_CW18","caseNumber":"TS018818909","owner":"Hareesh Gaddam","title":"[14-P] RCA - a custom tool that fetches work items ran 3 times longer than usually","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"40 days","closedDate":"2025-04-30","comments":"Issue with custom export tool script, post modification of the script issue got resolved","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS019124233_CW18","caseNumber":"TS019124233","owner":"Kabelesh K","title":"ALM-06-P CCM - scan on SCM_COMPONENT_ENTRY runs minutes  and leading to reaching the connections limit","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"8 days","closedDate":"2025-04-30","comments":"Created the SCM index and issue got resolved. To investigate further raised TS019191200 from IBM end.","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS015370916_CW18","caseNumber":"TS015370916","owner":"Hareesh Gaddam","title":"23-P DNG Skipped resources in ALM production systems","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"452 days","closedDate":"2025-01-05","comments":"Issue is not resolved. IBM provided work around to try validation with clear cache option","category":"TRS Validation","created":"","solutionDate":""},{"id":"TS016696531_CW18","caseNumber":"TS016696531","owner":"Hareesh Gaddam","title":"14-P Skipped resources - TRS Validation needed","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"295 days","closedDate":"2025-01-05","comments":"Removed  corrupted baseline post that issue got resolved","category":"TRS Validation","created":"","solutionDate":""},{"id":"TS018834087_CW18","caseNumber":"TS018834087","owner":"Sandeep Yashoda","title":"ALM-20-P DCC Job failed Requirement Management - Types and Attributes","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"39 days","closedDate":"2025-02-05","comments":"After 7.0.3 upgrade Issue got fixed","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018845048_CW18","caseNumber":"TS018845048","owner":"Sandeep Yashoda","title":"ALM-20-P DW report \"Copy of Suzuki_DA3_SYT_Defect_CreationTrend_Daily\" fails with ORA-01013 error","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"38 days","closedDate":"2025-02-05","comments":"In RS application we Increased socket time out property from 1201 to 7201 still issue didnt solve. Post that asked user to remove the condition from the report issue got resolved","category":"JRS / Reports","created":"","solutionDate":""}],"CW19":[{"id":"TS018678813_CW19","caseNumber":"TS018678813","owner":"Arjunan Malliga","title":"ALM-04-P CCM Application down due to  high Cpu usage.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"60 days","closedDate":"2025-05-05","comments":"RPM script ran for so many hours which cause the app down","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS019125685_CW19","caseNumber":"TS019125685","owner":"Kesavan R","title":"ALM -03-P: CCM We are facing some issue while modify the workitem.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"13 days","closedDate":"2025-05-05","comments":"Temporary issue and user confirm that issue got resolved. For RCA analysis user didnt provide proper details to proceed.","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS019122629_CW19","caseNumber":"TS019122629","owner":"Arjunan Malliga","title":"IN ALM-20-P-CCM Issue with hasAttribute() Not Detecting \"Description\"","customerNumber":"284926","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"16 days","closedDate":"2025-08-05","comments":"Arjun will re-open and handover the case","category":"","created":"","solutionDate":""},{"id":"TS018237988_CW19","caseNumber":"TS018237988","owner":"Kabelesh K","title":"[DT365625] ALM-12-P LQE - JTS Link Validity Resources (TRS 2.0) failed with Rollback Detected","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"115 days","closedDate":"2025-08-05","comments":"Issue will be fixed in 7.0.3 ifix15","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018690986_CW19","caseNumber":"TS018690986","owner":"Srinivasareddy","title":"ALM-11-Q-QM OSLC migration after upgrade to 7.0.3 takes over a week and is using a lot of CPU","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"62 days","closedDate":"2025-08-05","comments":"IBM provided debug to speed up the oslc migartion but it didnt help where migration is completed","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018108513_CW19","caseNumber":"TS018108513","owner":"Srinivasareddy","title":"DT365625 [ALM-11-P LQE] -JTS Link Validity Resources (TRS 2.0) failed with Rollback Detected","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"139 days","closedDate":"2025-08-05","comments":"Issue will be fixed in 7.0.3 ifix15","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019230291_CW19","caseNumber":"TS019230291","owner":"Sandeep Yashoda","title":"ALM-02-Q links are not visible after ifix015 upgrade","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"3 days","closedDate":"2025-08-05","comments":"Links were added in release post that its wokring fine","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018717227_CW19","caseNumber":"TS018717227","owner":"Imayavarman N J","title":"ALM-12-P RS Importing reports into a different LQE data source fails with CRRGW5101E The URL for JRS was not found & CRRGW5602E The variables in the query do not match","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"59 days","closedDate":"2025-09-05","comments":"Imay will update","category":"LQE / LDX","created":"","solutionDate":""}],"CW20":[{"id":"TS019116397_CW20","caseNumber":"TS019116397","owner":"Sangavi Devaraj","title":"[DT436562]Datawarehouse reports in ALM-20-P is not working fine after ELM 7.0.3","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"21 days","closedDate":"2025-05-12","comments":"This fix will be available on ifix16 of 7.0.3 which will be tentatively released by 30th May.","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS019206198_CW20","caseNumber":"TS019206198","owner":"Kabelesh K","title":"ALM-06-P DW â€“ Report Builder Showing Incorrect End Dates","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"11 days","closedDate":"2025-05-13","comments":"Issue got resolved post running delta load applied on dcc","category":"","created":"","solutionDate":""},{"id":"TS019124966_CW20","caseNumber":"TS019124966","owner":"Hareesh Gaddam","title":"ALM-14-P-DCC:  Requirement management job failed","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"21 days","closedDate":"2025-05-13","comments":"Entries are not present in the logs so ibm couldnt investigate. If the issue again occurs we need to collect the logs for investigation","category":"","created":"","solutionDate":""},{"id":"TS019155119_CW20","caseNumber":"TS019155119","owner":"Maheswaran Murugesan","title":"ALM-06-P CCM - 3 similar SQL queries (1q20tkptubdny, arkjnhfkrkwy0, 6auccy0k88t2x) are using 3 CPUs 24/7","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"19 days","closedDate":"2025-05-14","comments":"","category":"","created":"","solutionDate":""},{"id":"TS018982492_CW20","caseNumber":"TS018982492","owner":"Srinivasareddy","title":"Standby IBM case for ELM 7.0.3iFix013 upgrade on All ALM production systems","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"35 days","closedDate":"2025-05-15","comments":"Standby Case","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS019259588_CW20","caseNumber":"TS019259588","owner":"Kabelesh K","title":"ALM-06-P DW â€“ Exporting JRS results to PowerBI limits the results to 3000.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"6 days","closedDate":"2025-05-15","comments":"The issue was related to default query result limitations introduced in JRS version 7.0.3. The resolution involved appending the &limit=20000 parameter to the report URL used in Power BI.","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS018717722_CW20","caseNumber":"TS018717722","owner":"Sandeep Yashoda","title":"[DT437778] - ALM-20-Q-DNG  Timeout error with RM.Data.getContentsStructure","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"65 days","closedDate":"2025-05-15","comments":"Created Defect https://www.ibm.com/mysupport/s/defect/aCIgJ0000000K1x/dt437778","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS018927208_CW20","caseNumber":"TS018927208","owner":"Sandeep Yashoda","title":"ALM-20-P-DNG LQE report on requirements in module 703923 shows 119 results instead of the expected 93","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"43 days","closedDate":"2025-05-16","comments":"We will repoen this case next week","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019020627_CW20","caseNumber":"TS019020627","owner":"Hareesh Gaddam","title":"ALM-14-P: License issue for multiple applications","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"31 days","closedDate":"2025-05-16","comments":"Issue happened temporarily, we provided the logs as well but ibm could find anything in the logs. if again it happens need to collect data.","category":"","created":"","solutionDate":""}],"CW21":[{"id":"TS019189427_CW21","caseNumber":"TS019189427","owner":"Pavithra Shree Mathivanan","title":"Clarification on Application Upgrade Order for 7.1.0","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"19 days","closedDate":"2025-05-19","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018949050_CW21","caseNumber":"TS018949050","owner":"Sandeep Yashoda","title":"ALM-20-P-QM Application outage on April 04th.","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"42 days","closedDate":"2025-05-19","comments":"Let me close this Case because it is a duplicate of TS017137762.","category":"Duplicate","created":"","solutionDate":""},{"id":"TS019143781_CW21","caseNumber":"TS019143781","owner":"Imayavarman N J","title":"Alm-13 Test Case to Requirement links are missing in Data Warehouse report results","customerNumber":"284926","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"26 days","closedDate":"2025-05-20","comments":"Customer handled cases","category":"Customer","created":"","solutionDate":""},{"id":"TS019309341_CW21","caseNumber":"TS019309341","owner":"Sandeep Yashoda","title":"Standby IBM case for ELM 7.0.3iFix015 upgrade on All ALM production systems","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"6 days","closedDate":"2025-05-21","comments":"Stand by case","category":"Standby","created":"","solutionDate":""},{"id":"TS019273474_CW21","caseNumber":"TS019273474","owner":"Harshitha Nalukurthi","title":"ALM-06-T RM Can't be able to archive the PA","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"9 days","closedDate":"2025-05-21","comments":"Used project check tool in RM. Found the problematic projects and fixed it.","category":"L3 Tool","created":"","solutionDate":""},{"id":"TS019221799_CW21","caseNumber":"TS019221799","owner":"Harshitha Nalukurthi","title":"Requirement Management DCC Job fails in both ALM-20-D","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"17 days","closedDate":"2025-22-05","comments":"PA causing an issue which is inactive one. checked with customer and archived the PA. Post that DCC Job got success","category":"","created":"","solutionDate":""},{"id":"TS018691406_CW21","caseNumber":"TS018691406","owner":"Harshitha Nalukurthi","title":"Requirement Management - Types and Attribute DCC Job fails in 06-T","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"76 days","closedDate":"2025-22-05","comments":"Used project check tool in RM. Found the problematic projects and fixed it.","category":"","created":"","solutionDate":""},{"id":"TS018950952_CW21","caseNumber":"TS018950952","owner":"Imayavarman N J","title":"To know the usage of ALM LQE new RMM Data source","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"46 days","closedDate":"2025-23-05","comments":"Got info from IBM to create new RMM Data source and about its use & functionality","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019156056_CW21","caseNumber":"TS019156056","owner":"Imayavarman N J","title":"ALM-13-P-CCM Application down due to Out of Memory.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"28 days","closedDate":"2025-23-05","comments":"Increased Heap size as per IBM recommended","category":"OOM / App Down","created":"","solutionDate":""}],"CW22":[{"id":"TS019344274_CW22","caseNumber":"TS019344274","owner":"Kesavan R","title":"ALM-03-P RM - DNG restricts the visibility and editability of link validity within the default view.","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"6 days","closedDate":"2025-26-05","comments":"Temporary issue and user confirmed issue got resolved.","category":"DNG / RM","created":"","solutionDate":""},{"id":"TS019143699_CW22","caseNumber":"TS019143699","owner":"Hareesh Gaddam","title":"ALM-14-P: fetching test artifacts using Reportable REST API is taking 4x longer after the upgrade to 7.0.3","customerNumber":"284926","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"32 days","closedDate":"2025-26-05","comments":"After Installing testfix issue got resolved","category":"TestFix","created":"","solutionDate":""},{"id":"TS019397619_CW22","caseNumber":"TS019397619","owner":"Sandeep Yashoda","title":"ALM-12-Q Exports issue after ifix015 upgrade","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"0 days","closedDate":"2025-26-05","comments":"User Cretaed IBM case TS019308316 already. So we can close this case.","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS015986924_CW22","caseNumber":"TS015986924","owner":"Hareesh Gaddam","title":"05-P DNG Resources is reporting 212 skipped resources.","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"407 days","closedDate":"2025-27-05","comments":"Hareesh will re-open this case after planning the TRS feed validation","category":"TRS Validation","created":"","solutionDate":""},{"id":"TS019168881_CW22","caseNumber":"TS019168881","owner":"Shameera Fairoz Shajahan","title":"Repotools-jts setup for LQE fails with CRJAZ2438E An error occurred while invoking the service /lqe/app-config","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"29 days","closedDate":"2025-27-05","comments":"","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019334018_CW22","caseNumber":"TS019334018","owner":"Harshitha Nalukurthi","title":"Date Format Issue in Work Items After ELM 7.0.3 Upgrade","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"9 days","closedDate":"2025-28-05","comments":"Please try the steps provided in the below technote to change the date format when exporting works items to csv file:\r\n\r\nhttps://www.ibm.com/support/pages/node/7185659","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS018927387_CW22","caseNumber":"TS018927387","owner":"Srinivasareddy","title":"Newly added RQM attributes related to Test plan missing in LQE reports while testing 7.0.3 features","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"56 days","closedDate":"2025-28-05","comments":"As per IBM documentation New features are not working","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019311234_CW22","caseNumber":"TS019311234","owner":"Kabelesh K","title":"DW creation fails with  ORA-01031: insufficient privileges","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by Client","age":"14 days","closedDate":"2025-29-05","comments":"Following the wiki issue got resolved - https://jazz.net/wiki/bin/view/Deployment/CreateOracleDataWarehouseWithoutDBAPermissions","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS019367134_CW22","caseNumber":"TS019367134","owner":"Sandeep Yashoda","title":"ALM-20-P-QM Application down on 22th May 2025 caused by exporting Test Case to PDF","customerNumber":"881812","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"7 days","closedDate":"2025-29-05","comments":"Duplicate case TS017137762","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018971580_CW22","caseNumber":"TS018971580","owner":"Shameera Fairoz Shajahan","title":"Repotools-jts setup fails during Configure Data Warehouse Database step for RELM application","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"50 days","closedDate":"2025-29-05","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS019389857_CW22","caseNumber":"TS019389857","owner":"Hareesh Gaddam","title":"ALM-14-P:  Project area's dashboard not accessible","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"4 days","closedDate":"2025-30-05","comments":"JTS index got corrupted, To resolve this ran repotool command in the JTS server","category":"","created":"","solutionDate":""},{"id":"TS019298991_CW22","caseNumber":"TS019298991","owner":"Sangavi Devaraj","title":"To detect the long running DCC jobs status","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"16 days","closedDate":"2025-30-05","comments":"Using UI logs and set some rules to get alert from splunk. Mbeans didnt help.","category":"","created":"","solutionDate":""},{"id":"TS019188111_CW22","caseNumber":"TS019188111","owner":"Shanmugasundaram S","title":"ALM13P1 | Delete statement creates DB lock","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"30 days","closedDate":"2025-30-05","comments":"","category":"","created":"","solutionDate":""}],"CW23":[{"id":"TS018658638_CW23","caseNumber":"TS018658638","owner":"Srinivasareddy","title":"DNG attributes Modified By not update on Selected artifact in ALM quality systems","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"90 days","closedDate":"2025-02-06","comments":"Issue will be fixed in ifix016","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS019241139_CW23","caseNumber":"TS019241139","owner":"Sandeep Yashoda","title":"ALM-20-P-QM - RCA of OOME that was observed on April 15th","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"27 days","closedDate":"2025-03-06","comments":"Duplicate case","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS018962272_CW23","caseNumber":"TS018962272","owner":"Harshitha Nalukurthi","title":"ALM-22-P LQE Report return no results","customerNumber":"284926","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"56 days","closedDate":"2025-03-06","comments":"No response from user end even after multiple folloups","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019408660_CW23","caseNumber":"TS019408660","owner":"Hareesh Gaddam","title":"ALM-14-Q: GC application not loading","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"6 days","closedDate":"2025-03-06","comments":"Post restart issue got resolved","category":"","created":"","solutionDate":""},{"id":"TS019143906_CW23","caseNumber":"TS019143906","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"*EMEA* SELinux issues during the installation of IHS/UCD agent on RHEL9.","customerNumber":"881812","product":"WebSphere Application Server","severity":"2","status":"Closed by IBM","age":"41 days","closedDate":"2025-04-06","comments":"","category":"Liberty / IHS","created":"","solutionDate":""},{"id":"TS019182690_CW23","caseNumber":"TS019182690","owner":"Srinivasareddy","title":"ALM-11-P CCM down due to java.lang.OutOfMemoryError: Java heap space","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"36 days","closedDate":"2025-04-06","comments":"Planning to increase memory in future","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS019379311_CW23","caseNumber":"TS019379311","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"How to move attachments stored in CCM db to external attachment repository","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"14 days","closedDate":"2025-06-06","comments":"","category":"Query / General","created":"","solutionDate":""},{"id":"TS019445251_CW23","caseNumber":"TS019445251","owner":"Sangavi Devaraj","title":"ALM-19-P QM the iteration is incorrect and provides wrong results","customerNumber":"284926","product":"Engineering Test Management","severity":"4","status":"Closed by IBM","age":"4 days","closedDate":"2025-06-06","comments":"The issue was resolved by applying a workaround: querying the Test Case Execution Record (TCER), then using the returned rqm_qm:testSchedule value to fetch the test schedule, and finally querying the process:iteration link from that response. This method returned the correct iteration details as shown in the UI","category":"ETM / QM","created":"","solutionDate":""}],"CW24":[{"id":"TS019539458_CW24","caseNumber":"TS019539458","owner":"Srinivasareddy","title":"ETM Resources (TRS 2.0) data source failed in ALM-11-Q-LQE","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Cancelled","age":"1 day","closedDate":"2025-09-06","comments":"Duplicate Case","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018904733_CW24","caseNumber":"TS018904733","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Extra data source for CCM & AM on LDX in 7.0.3","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"70 days","closedDate":"2025-10-06","comments":"","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019249014_CW24","caseNumber":"TS019249014","owner":"Maheswaran Murugesan","title":"Custom Oracle DB Index Analysis | Exising and Current - ELM 7.0.3 rollout","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"34 days","closedDate":"2025-11-06","comments":"","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS019506650_CW24","caseNumber":"TS019506650","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Running IHS as non root user and as a systemd service on RHEL9 with Selinux enabled.","customerNumber":"881812","product":"WebSphere Application Server","severity":"2","status":"Closed by IBM","age":"7 days","closedDate":"2025-11-06","comments":"","category":"Liberty / IHS","created":"","solutionDate":""},{"id":"TS019359462_CW24","caseNumber":"TS019359462","owner":"Srinivasareddy","title":"JRS reports getting error in custom expression","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"23 days","closedDate":"2025-13-06","comments":"Duplicate Case - TS019261169","category":"JRS / Reports","created":"","solutionDate":""}],"CW25":[{"id":"TS018584854_CW25","caseNumber":"TS018584854","owner":"Kabelesh K","title":"[7.0.3] - DNG - Check and repair \"unwanted artifact updates\" from ReqIF import issue","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"112 days","closedDate":"2025-16-06","comments":"IBM confirmed the issue was caused by a known defect (DT416614) in ReqIF imports (between 7.0.2 iFix019–029 and 7.0.3 GA–iFix004), which created duplicate mappings in DNG components.\r\n\r\nIBM provided a repair tool (repotools-rm -rmRepairDuplicateMappingCommand) that was already included from 7.0.3 iFix013.\r\n\r\nSteps followed:\r\n\r\nRun in analyze mode to detect duplicate mappings across components.\r\n\r\nIf duplicates were found, IBM shared repair command files (per environment) for execution.\r\n\r\nRunning in repair mode cleaned duplicate entries in ReqIF mapping tables.\r\n\r\nVerification was done by re-running the analysis, which then reported “No duplicates detected.”\r\n\r\nAfter repair, unwanted artifact updates stopped, and ReqIF imports worked correctly without overwriting wrong artifacts","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS019419858_CW25","caseNumber":"TS019419858","owner":"Kabelesh K","title":"ALM-06-P CCM - Unable download the spreadsheet after running query","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"18 days","closedDate":"2025-16-06","comments":"The issue occurred because the “Download as Spreadsheet” option is only enabled when queries are accessed from “My Queries”, not from the edit query section.\r\n\r\nIn EWM 7.0.3, there is also a specific permission required: “Export Query Result.”\r\n\r\nOnce this permission was granted to the user’s role, and the query was run from My Queries, the option became available and users were able to successfully download the results as a spreadsheet\r\n\r\nhttps://www.ibm.com/docs/en/engineering-lifecycle-management-suite/workflow-management/7.0.3?topic=cq-creating-queries","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS019398057_CW25","caseNumber":"TS019398057","owner":"Sandeep Yashoda","title":"ALM-20-P reportable rest API issue","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"2","status":"Closed by IBM","age":"20 days","closedDate":"2025-16-06","comments":"1) According to your Java Core's we see you have the configCache size set to 4000 \r\n\r\n-Dcom.ibm.rdm.configcache.size=4000\r\nbut you have 8122 configurations in this repository that are not archived. Please refer to the following technote and increase this size appropriately. \r\n\r\nTuning the configuration cache for IBM Engineering Requirements Management DOORS Next V7.X\r\n\r\nTake into the account the following line:\r\n\r\nIf your repository is expected to increase the number of projects, baselines or configurations, then consider setting the cache parameters to a value larger than the current number of configurations returned by the SQL query.\r\nSo for example you could increase this value to 9000. \r\n\r\n2) You should then consider the amount of heap you have in place. Currently it is:\r\n\r\n-Xms81920m\" \"-Xmx81920m\" \"-Xmn20480m\r\nFor Xmx and Xms you should conisder increasing this by 10GB.","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS019385058_CW25","caseNumber":"TS019385058","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"How to automate the process of the External Repository creation?","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"25 days","closedDate":"2025-18-06","comments":"","category":"Query / General","created":"","solutionDate":""},{"id":"TS018226059_CW25","caseNumber":"TS018226059","owner":"Srinivasareddy","title":"Repotools rebuild text indices as part of 7.0.3 post upgrade activity","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"160 days","closedDate":"2025-19-06","comments":"Query on 7.0.3 and later version not required - Rebuild text indices","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS019595941_CW25","caseNumber":"TS019595941","owner":"Srinivasareddy","title":"ALM-23-P Exports are Slow","customerNumber":"284926","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"3 days","closedDate":"2025-19-06","comments":"Users handling case","category":"Performance / Slow","created":"","solutionDate":""},{"id":"TS019260560_CW25","caseNumber":"TS019260560","owner":"Kabelesh K","title":"ALM-06-P Report Builder. When a user looka at 'My Reports' it shows over 9000 report resutned.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"41 days","closedDate":"2025-19-06","comments":"IBM confirmed this is expected behavior in the new interface, as it displays shared folders too. Recommended workaround: organize reports by creating a top-level Users folder, with each user having their own sub-folder to store reports - https://jazz.net/library/article/97977","category":"","created":"","solutionDate":""},{"id":"TS018867981_CW25","caseNumber":"TS018867981","owner":"Srinivasareddy","title":"Icons issue in project dashboard for AM & CCM applications on 11q after 7.0.3","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"84 days","closedDate":"2025-19-06","comments":"Removed properties from web.xml which is related to graphics (icons)","category":"7.0.3","created":"","solutionDate":""},{"id":"TS019122629_CW25","caseNumber":"TS019122629","owner":"Sandeep Yashoda","title":"IN ALM-20-P-CCM Issue with hasAttribute() Not Detecting \"Description\"","customerNumber":"284926","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"58 days","closedDate":"2025-19-06","comments":"Debugging of customised code and APIs is out of scope of ELM Support.","category":"","created":"","solutionDate":""},{"id":"TS019419188_CW25","caseNumber":"TS019419188","owner":"Hareesh Gaddam","title":"ALM-14-P-LDX : Links_CCM datasource is failing with \"Impossibly Large Object\"","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"22 days","closedDate":"2025-20-06","comments":"Rebuilt indices from scratch > Stop env -> ALm-config > remove indices > start env > reindex datasource --- LDX","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019273222_CW25","caseNumber":"TS019273222","owner":"Srinivasareddy","title":"ALM-11-Q QM down due to high heap usage & garbage collection.","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"40 days","closedDate":"2025-21-06","comments":"User activity created multiple links","category":"OOM / App Down","created":"","solutionDate":""}],"CW26":[{"id":"TS018975235_CW26","caseNumber":"TS018975235","owner":"Saharikaa S S","title":"Verification of automatic installation steps","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"4","status":"Closed by IBM","age":"75 days","closedDate":"2025-23-06","comments":"","category":"","created":"","solutionDate":""},{"id":"TS019237674_CW26","caseNumber":"TS019237674","owner":"Sandeep Yashoda","title":"ALM-20-P-JRS traceability report fails with Message CRRGW5301E An error occurred when obtaining the raw results from the data source","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"47 days","closedDate":"2025-23-06","comments":"User handled case","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019460241_CW26","caseNumber":"TS019460241","owner":"Sandeep Yashoda","title":"ALM-20-P-QM Application down on 03rd June 2025","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"21 days","closedDate":"2025-24-06","comments":"Duplicate case - Issue will be fixed ifix017","category":"OOM / App Down","created":"","solutionDate":""},{"id":"TS016540146_CW26","caseNumber":"TS016540146","owner":"Kabelesh K","title":"In ALM-28-P CCM, saving a wokitem fails a staledata error.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"369 days","closedDate":"2025-25-06","comments":"Closed due to case opened for long time - IBM has provided debug patch to apply","category":"CCM / Work Item","created":"","solutionDate":""},{"id":"TS018904733_CW26","caseNumber":"TS018904733","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Extra data source for CCM & AM on LDX in 7.0.3","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"86 days","closedDate":"2025-26-06","comments":"","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019572490_CW26","caseNumber":"TS019572490","owner":"Srinivasareddy","title":"ETM Resources (TRS 2.0) data source failed in ALM-11-Q-LQE","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"15 days","closedDate":"2025-27-06","comments":"Datasource got corrupted","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019541266_CW26","caseNumber":"TS019541266","owner":"Srinivasareddy","title":"ALM-11Q - ETM - Reindex of ETM data source after rebase in LDX is not moving forward","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"18 days","closedDate":"2025-27-06","comments":"Datasource got corrupted","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS019336712_CW26","caseNumber":"TS019336712","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Does the rename process also include the change of the external repository?","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"39 days","closedDate":"2025-27-06","comments":"","category":"","created":"","solutionDate":""},{"id":"TS019145684_CW26","caseNumber":"TS019145684","owner":"Srinivasareddy","title":"7.0.3 upgrade - 14P - \"Could not create JVM\" (JVMJ9VM015W) during the AM_upgrade.bat execution","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"64 days","closedDate":"2025-27-06","comments":"We got updated Documentation from IBM","category":"Upgrade / Rollout","created":"","solutionDate":""},{"id":"TS019229424_CW26","caseNumber":"TS019229424","owner":"Harshitha Nalukurthi","title":"[DT439328] ALM-25-P - TRS Validation in canceled with an error in the log: \"com.ibm.team.repository.common.TeamRepositoryException: State id must not be null\"","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"38 days","closedDate":"2025-13-06","comments":"Issue will be fixed in 7.2 but Harshita will reopen.\r\nReopened","category":"TRS Validation","created":"","solutionDate":""}],"CW27":[{"id":"TS019517739_CW27","caseNumber":"TS019517739","owner":"Sandeep Yashoda","title":"ALM-20-P Splunk reports not accessible in ALM dashboard","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"25 days","closedDate":"2025-30-06","comments":"Sangavi sent mail to users but no response from them","category":"Reopen / No Response","created":"","solutionDate":""},{"id":"TS019011596_CW27","caseNumber":"TS019011596","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Deletion of attachments stored on external storage repository (Artifactory) is not working.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"77 days","closedDate":"2025-30-06","comments":"","category":"","created":"","solutionDate":""},{"id":"TS019408391_CW27","caseNumber":"TS019408391","owner":"Hareesh Gaddam","title":"ALM-14-P : JRS export to XML is truncated to 3000 entries","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"34 days","closedDate":"2025-01-07","comments":"IBM has provided solution. Hareesh will implement it\r\n\r\nSpliting the huge exports and its wokring fine","category":"JRS / Reports","created":"","solutionDate":""},{"id":"TS019260158_CW27","caseNumber":"TS019260158","owner":"Kabelesh K","title":"ALM-06-P LQE - Reporting on Workitem Stories and parents results in the same story occurring multiple times.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"53 days","closedDate":"2025-01-07","comments":"User handling case","category":"LQE / LDX","created":"","solutionDate":""},{"id":"TS018584854_CW27","caseNumber":"TS018584854","owner":"Kabelesh K","title":"[7.0.3] - DNG - Check and repair \"unwanted artifact updates\" from ReqIF import issue","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"127 days","closedDate":"2025-01-07","comments":"IBM confirmed the issue was caused by a known defect (DT416614) in ReqIF imports (between 7.0.2 iFix019–029 and 7.0.3 GA–iFix004), which created duplicate mappings in DNG components.\r\n\r\nIBM provided a repair tool (repotools-rm -rmRepairDuplicateMappingCommand) that was already included from 7.0.3 iFix013.\r\n\r\nSteps followed:\r\n\r\nRun in analyze mode to detect duplicate mappings across components.\r\n\r\nIf duplicates were found, IBM shared repair command files (per environment) for execution.\r\n\r\nRunning in repair mode cleaned duplicate entries in ReqIF mapping tables.\r\n\r\nVerification was done by re-running the analysis, which then reported “No duplicates detected.”\r\n\r\nAfter repair, unwanted artifact updates stopped, and ReqIF imports worked correctly without overwriting wrong artifacts","category":"Defect / iFix","created":"","solutionDate":""},{"id":"TS019261169_CW27","caseNumber":"TS019261169","owner":"Hareesh Gaddam","title":"[DT439949] ALM-14-P: Custom expressions are not working in JRS Reports","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"54 days","closedDate":"2025-02-07","comments":"Reopen and ask ibm to confirm the ifix version","category":"JRS / Reports","created":"","solutionDate":""}]},
  "2026": {"CW01":[{"id":"TS020857577_CW01","caseNumber":"TS020857577","owner":"Srinivasareddy","title":"Advantages and disadvantages of scheduling LQE EWM datasource validation","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"37 days","closedDate":"2026-01-02","category":"LQE / LDX","comments":"","created":"11/26/2025 5:15 AM","solutionDate":"11/27/2025 3:12 AM","country":"Germany"}],"CW02":[{"id":"TS020884738_CW02","caseNumber":"TS020884738","owner":"Kabelesh K","title":"ALM-28-P CCM TRS validation failed.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"36 days","closedDate":"2026-01-06","category":"Reopen","comments":"No proper response from the user","created":"12/1/2025 2:13 AM","solutionDate":"12/1/2025 9:09 AM","country":"Germany"},{"id":"TS020893826_CW02","caseNumber":"TS020893826","owner":"Sumsudeen Syed mohamed","title":"Steps for Upgrading Java on the Deploy Server (OpenShift Environment)","customerNumber":"284926","product":"DevOps Deploy","severity":"3","status":"Closed by IBM","age":"36 days","closedDate":"2026-01-07","category":"","comments":"","created":"12/2/2025 12:14 AM","solutionDate":"12/5/2025 3:27 AM","country":"Germany"},{"id":"TS020896444_CW02","caseNumber":"TS020896444","owner":"Harshitha Nalukurthi","title":"Comment Editor – No Space After User Tag (CTRL + U)","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"36 days","closedDate":"2026-01-07","category":"Defect","comments":"Issue will be fixed in 7.3 release (https://www.ibm.com/mysupport/s/defect/aCIgJ0000008WvZ/dt458390)","created":"12/2/2025 6:19 AM","solutionDate":"12/4/2025 12:11 AM","country":"Germany"},{"id":"TS020997982_CW02","caseNumber":"TS020997982","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Applications are not accessible via IHS after Runtime upgrade and patch weekend reboot.","customerNumber":"881812","product":"WebSphere Application Server","severity":"3","status":"Closed by IBM","age":"22 days","closedDate":"2026-01-07","category":"Upgrade / Rollout","comments":"","created":"12/16/2025 3:45 AM","solutionDate":"12/18/2025 3:20 AM","country":"Germany"},{"id":"TS020794655_CW02","caseNumber":"TS020794655","owner":"Kabelesh K","title":"ALM-06-P CCM - Missing Data in Report for Change Request 4415211","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"50 days","closedDate":"2026-01-07","category":"LQE Validation","comments":"Post Lqe validation issue has been resolved","created":"11/18/2025 6:15 AM","solutionDate":"11/26/2025 5:28 AM","country":"Germany"},{"id":"TS020965667_CW02","caseNumber":"TS020965667","owner":"Sabari M","title":"02-Q RS Report some attribute values are missing.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"27 days","closedDate":"2026-01-07","category":"LQE Validation","comments":"Post Lqe validation issue has been resolved","created":"12/11/2025 3:03 AM","solutionDate":"12/18/2025 5:49 AM","country":"Germany"},{"id":"TS020895368_CW02","caseNumber":"TS020895368","owner":"Sumsudeen Syed mohamed","title":"How to configure High Availability for DevOps Deploy on OpenShift?","customerNumber":"284926","product":"DevOps Deploy","severity":"4","status":"Closed by IBM","age":"37 days","closedDate":"2026-01-08","category":"Query / General","comments":"","created":"12/2/2025 4:01 AM","solutionDate":"12/11/2025 11:52 PM","country":"Germany"},{"id":"TS021037407_CW02","caseNumber":"TS021037407","owner":"Sandeep Yashoda","title":"Clarification about JVM Settings","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"22 days","closedDate":"2026-01-09","category":"Query","comments":"Xnocompress must be used in liberty more than 24GB","created":"12/18/2025 12:48 AM","solutionDate":"12/19/2025 5:16 AM","country":"Germany"}],"CW03":[{"id":"TS020860777_CW03","caseNumber":"TS020860777","owner":"Shameera Fairoz Shajahan","title":"functional user to use for lqe rs application with custom context root","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"46 days","closedDate":"2026-01-11","category":"LQE / LDX","comments":"","created":"11/26/2025 11:07 AM","solutionDate":"12/1/2025 4:02 AM","country":"Germany"},{"id":"TS019441957_CW03","caseNumber":"TS019441957","owner":"Hareesh Gaddam","title":"ALM-14-P: (baseline only PA) JRS-LQE reports count mis-match when compared to JRS-DW","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"224 days","closedDate":"2026-01-12","category":"LQE Validation","comments":"Post LQE Validation issue has been resolved","created":"6/2/2025 12:17 AM","solutionDate":"6/3/2025 7:19 AM","country":"Germany"},{"id":"TS021176692_CW03","caseNumber":"TS021176692","owner":"Pavithra Shree Mathivanan","title":"7.1.0.SR1 iFix007 JRS Build ID mismatch","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"1 day","closedDate":"2026-01-13","category":"JRS / Reports","comments":"","created":"1/12/2026 4:18 AM","solutionDate":"1/12/2026 7:33 AM","country":"Germany"},{"id":"TS015273544_CW03","caseNumber":"TS015273544","owner":"Imayavarman N J","title":"[13-Q][13-P] DOORS-ETM Link discovery fails with operation timeout error","customerNumber":"284926","product":"Engineering Test Management","severity":"2","status":"Closed by IBM","age":"722 days","closedDate":"2026-01-15","category":"ETM / QM","comments":"","created":"","solutionDate":"","country":""},{"id":"TS019609706_CW03","caseNumber":"TS019609706","owner":"Kabelesh K","title":"ALM-06-P LQE - Some work items have not been updated in LQE (TRS Validation is failing with errors 401, 403, 500, 502, Read timed out)","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"212 days","closedDate":"2026-01-15","category":"LQE Validation","comments":"Post LQE Validation issue has been resolved","created":"6/17/2025 9:28 AM","solutionDate":"6/17/2025 10:06 AM","country":"Germany"},{"id":"TS020846014_CW03","caseNumber":"TS020846014","owner":"Sabari M","title":"04-P Unable to link multiple Requirements to a Defect Work Item (WI) using the \"Affects Requirement\"","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"52 days","closedDate":"2026-01-16","category":"Reopen","comments":"issue is not yet fixed","created":"11/25/2025 12:22 AM","solutionDate":"12/8/2025 12:18 PM","country":"Germany"}],"CW04":[{"id":"TS020848028_CW04","caseNumber":"TS020848028","owner":"Hareesh Gaddam","title":"ALM-14-P RCA: Environment was not accessible for around 10 minutes","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"55 days","closedDate":"2026-01-19","category":"Lack of logs","comments":"Missing java cores to investigate","created":"11/25/2025 4:55 AM","solutionDate":"1/16/2026 5:12 AM","country":"Germany"},{"id":"TS021177105_CW04","caseNumber":"TS021177105","owner":"Hareesh Gaddam","title":"ALM-14P JRS report contain duplicate entry of specific Test Cases","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"8 days","closedDate":"2026-01-20","category":"LQE Validation","comments":"Post LQE Validation issue has been resolved","created":"1/12/2026 5:03 AM","solutionDate":"1/12/2026 8:08 AM","country":"Germany"},{"id":"TS021108496_CW04","caseNumber":"TS021108496","owner":"Srinivasareddy","title":"TRS Feed validation is getting cancelled on ALM-11-P-QM","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"18 days","closedDate":"2026-01-20","category":"TRS Validation","comments":"","created":"1/2/2026 12:56 AM","solutionDate":"1/5/2026 4:39 AM","country":"Germany"},{"id":"TS020578116_CW04","caseNumber":"TS020578116","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"ISADC log collection sometimes fails on different BUs","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"91 days","closedDate":"2026-01-20","category":"","comments":"","created":"10/21/2025 4:56 AM","solutionDate":"12/19/2025 9:49 AM","country":"Germany"},{"id":"TS021147583_CW04","caseNumber":"TS021147583","owner":"Kabelesh K","title":"ALM-06-P CCM - Intermittent Check-in/Deliver and License Error – Investigation Request","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"13 days","closedDate":"2026-01-21","category":"License","comments":"License token usage reached the maximum limit.","created":"1/8/2026 6:13 AM","solutionDate":"1/8/2026 6:31 AM","country":"Germany"},{"id":"TS019982455_CW04","caseNumber":"TS019982455","owner":"Kabelesh K","title":"ALM-06-P JRS - Dashboard reports shows \"No results found\"","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"170 days","closedDate":"2026-01-22","category":"LQE Validation","comments":"Post LQE Validation Dashboard is visible","created":"8/5/2025 4:26 AM","solutionDate":"8/11/2025 4:35 AM","country":"Germany"}],"CW05":[{"id":"TS020054298_CW05","caseNumber":"TS020054298","owner":"Kesavan R","title":"IBM ALM_07-P RS report error.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"166 days","closedDate":"1/27/2026 1:06","category":"Reopened","comments":"No proper response from the user","created":"8/14/2025 3:37 AM","solutionDate":"9/5/2025 10:13 AM","country":"Germany"},{"id":"TS020757843_CW05","caseNumber":"TS020757843","owner":"Kesavan R","title":"ALM-07-P - RCA of QM down on 13-Nov-2025","customerNumber":"881812","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"75 days","closedDate":"1/27/2026 1:16","category":"Reopen","comments":"No response from our end","created":"11/12/2025 11:23 PM","solutionDate":"11/18/2025 6:12 AM","country":"Germany"},{"id":"TS021289880_CW05","caseNumber":"TS021289880","owner":"Kabelesh K","title":"Restarting a node while a delta job is in progress.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"0 days","closedDate":"1/27/2026 1:21","category":"Query","comments":"Node restart can be done via without force stop restart UCD process","created":"1/27/2026 1:11 AM","solutionDate":"1/27/2026 1:19 AM","country":"Germany"},{"id":"TS021189263_CW05","caseNumber":"TS021189263","owner":"Sandeep Yashoda","title":"ALM-20-P-QM – Copy Artifact Link in Test Case Does Not Copy the Link in Browser Tab","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"14 days","closedDate":"1/27/2026 7:07","category":"Artifact","comments":"Basically \"Copy Artifact Link\" option from the Browse table is used to create link between different Artifacts like link work item with test case or Test Case to Test Plan. It does not copy or paste link on clipboard.","created":"1/13/2026 8:26 AM","solutionDate":"1/13/2026 10:07 AM","country":"Germany"},{"id":"TS020686427_CW05","caseNumber":"TS020686427","owner":"Sabari M","title":"[DT450899] Data Inconsistency between instant export and scheduled export","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"85 days","closedDate":"1/28/2026 5:13","category":"130","comments":"","created":"11/4/2025 6:08 AM","solutionDate":"11/7/2025 8:23 AM","country":"Germany"},{"id":"TS021261309_CW05","caseNumber":"TS021261309","owner":"Kesavan R","title":"ALM-07-P-QM - GC config the ValidatedBy link not visible in the requirement","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"7 days","closedDate":"1/29/2026 3:11","category":"135","comments":"","created":"1/22/2026 8:19 AM","solutionDate":"1/22/2026 8:26 AM","country":"Germany"},{"id":"TS020804388_CW05","caseNumber":"TS020804388","owner":"Sabari M","title":"02-Q QM OSLC Selection Dialog Integration Fails with 401 OAuth Signature Error","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by Client","age":"72 days","closedDate":"1/30/2026 5:30","category":"CDCM","comments":"Out of scope and informed stefan","created":"11/19/2025 4:22 AM","solutionDate":"12/3/2025 3:26 AM","country":"Germany"}],"CW06":[{"id":"TS020885261_CW06","caseNumber":"TS020885261","owner":"Sandeep Yashoda","title":"Disable Mail Notification backlog for ALM 23-P","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"64 days","closedDate":"2026-03-02","category":"145","comments":"","created":"12/1/2025 3:21 AM","solutionDate":"1/19/2026 4:13 AM","country":"Germany"},{"id":"TS021259458_CW06","caseNumber":"TS021259458","owner":"Sandeep Yashoda","title":"How to set the \"Format Email Messages in HTML\" as default for CCM users","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"12 days","closedDate":"2026-03-02","category":"149","comments":"","created":"1/22/2026 4:33 AM","solutionDate":"1/22/2026 5:56 AM","country":"Germany"},{"id":"TS021229385_CW06","caseNumber":"TS021229385","owner":"Srinivasareddy","title":"Physical Memory Usage is fully untilization during compaction running","customerNumber":"881812","product":"Engineering Lifecycle Management Base","severity":"3","status":"Closed by IBM","age":"16 days","closedDate":"2026-04-02","category":"154","comments":"","created":"1/19/2026 2:46 AM","solutionDate":"1/20/2026 3:39 AM","country":"Germany"},{"id":"TS021205962_CW06","caseNumber":"TS021205962","owner":"Saharikaa S S","title":"JTS setup Fails with CRJAZ2438E During License Assignment","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"21 days","closedDate":"2026-05-02","category":"","comments":"","created":"1/15/2026 1:14 AM","solutionDate":"1/15/2026 1:29 AM","country":"Germany"},{"id":"TS020152982_CW06","caseNumber":"TS020152982","owner":"Hareesh Gaddam","title":"ALM-14-P: DNG application Slowness for 4 users","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by IBM","age":"163 days","closedDate":"2026-06-02","category":"163","comments":"","created":"8/27/2025 9:35 AM","solutionDate":"12/30/2025 10:13 AM","country":"Germany"}],"CW07":[{"id":"TS021336609_CW07","caseNumber":"TS021336609","owner":"Sabari M","title":"01-P Investigate the root cause for \"Out of Memory\" alert","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"7 days","closedDate":"2026-09-02","category":"109","comments":"","created":"2/2/2026 4:58 AM","solutionDate":"2/3/2026 6:30 AM","country":"Germany"},{"id":"TS021237524_CW07","caseNumber":"TS021237524","owner":"Kabelesh K","title":"ALM-06-P LQE - isadc.sh fails on Linux with “Could not find or load main class -Xmx128M”","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"21 days","closedDate":"2026-09-02","category":"168","comments":"","created":"1/20/2026 12:40 AM","solutionDate":"1/20/2026 12:45 AM","country":"Germany"},{"id":"TS021388768_CW07","caseNumber":"TS021388768","owner":"Kabelesh K","title":"ALM-06-Q DCC Job Failure: Requirement Management Facts","customerNumber":"881812","product":"Engineering Requirements Management DOORS Next","severity":"3","status":"Closed by Client","age":"8 days","closedDate":"2026-12-02","category":"171","comments":"","created":"2/4/2026 3:54 AM","solutionDate":"2/4/2026 6:13 AM","country":"Germany"},{"id":"TS020987867_CW07","caseNumber":"TS020987867","owner":"Harshitha Nalukurthi","title":"Obsolete CLM Indexes on Disk – Recurring Splunk AME Alert","customerNumber":"881812","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"59 days","closedDate":"2026-12-02","category":"175","comments":"","created":"12/15/2025 3:07 AM","solutionDate":"12/15/2025 3:13 AM","country":"Germany"},{"id":"TS021136929_CW07","caseNumber":"TS021136929","owner":"Sabari M","title":"DCC Job failing on 02-t3 failing to retrieve attribute definitions of a project area","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"37 days","closedDate":"2/13/2026 3:54","category":"179","comments":"","created":"1/7/2026 2:30 AM","solutionDate":"1/7/2026 3:54 AM","country":"Germany"}],"CW08":[{"id":"TS021199527_CW08","caseNumber":"TS021199527","owner":"Kabelesh K","title":"ALM-06-P LQE - Change and Configuration Management Data source processing stuck at 294 resources since 2 days.","customerNumber":"284926","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"33 days","closedDate":"2/16/2026 1:51","category":"184","comments":"","created":"1/14/2026 8:17 AM","solutionDate":"","country":"Germany"},{"id":"TS021449951_CW08","caseNumber":"TS021449951","owner":"Nahusha Prasanna Koppa Chandrashekar","title":"Do we need to obtain new licenses for ELM 7.2.0?","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"3","status":"Closed by IBM","age":"4 days","closedDate":"2/16/2026 2:48","category":"","comments":"","created":"2/12/2026 12:57 AM","solutionDate":"2/12/2026 7:08 AM","country":"Germany"},{"id":"TS021440423_CW08","caseNumber":"TS021440423","owner":"Kabelesh K","title":"[06-p] Long running update after running out of disk space","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by Client","age":"7 days","closedDate":"2/17/2026 22:34","category":"192","comments":"","created":"2/11/2026 2:16 AM","solutionDate":"2/11/2026 3:51 AM","country":"Germany"},{"id":"TS021311932_CW08","caseNumber":"TS021311932","owner":"Asha S","title":"CRJAZ0099E Import Licenses failing during Upgrade from 7.0.3 to 7.1.0.SR1","customerNumber":"881812","product":"Engineering Lifecycle Management Suite","severity":"2","status":"Closed by IBM","age":"21 days","closedDate":"2/19/2026 5:46","category":"Upgrade / Rollout","comments":"","created":"1/29/2026 5:23 AM","solutionDate":"2/10/2026 2:53 AM","country":"Germany"},{"id":"TS021338005_CW08","caseNumber":"TS021338005","owner":"Sangavi Devaraj","title":"ALM-20-P RS User gets redirected to Main Reports page when session expires","customerNumber":"284926","product":"Engineering Workflow Management","severity":"4","status":"Closed by IBM","age":"18 days","closedDate":"2/20/2026 1:06","category":"","comments":"","created":"2/2/2026 7:56 AM","solutionDate":"2/6/2026 7:02 AM","country":"Germany"},{"id":"TS020824686_CW08","caseNumber":"TS020824686","owner":"Sabari M","title":"20-Q-CCM RCA: Application down.","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"94 days","closedDate":"2/23/2026 2:38","category":"OOM / App Down","comments":"","created":"11/21/2025 6:08 AM","solutionDate":"11/29/2025 5:54 AM","country":"Germany"},{"id":"TS021488127_CW08","caseNumber":"TS021488127","owner":"Sandeep Yashoda","title":"Standby support required on 21st feb 2026","customerNumber":"881812","product":"Engineering Workflow Management","severity":"3","status":"Closed by Client","age":"5 days","closedDate":"2/23/2026 2:59","category":"","comments":"","created":"2/18/2026 4:02 AM","solutionDate":"","country":"Germany"},{"id":"TS021440905_CW08","caseNumber":"TS021440905","owner":"Sandeep Yashoda","title":"ALM-20-P-CCM Application Down on 11th Feb 2026","customerNumber":"881812","product":"Engineering Workflow Management","severity":"2","status":"Closed by IBM","age":"13 days","closedDate":"2/24/2026 2:25","category":"OOM / App Down","comments":"","created":"2/11/2026 3:25 AM","solutionDate":"2/11/2026 4:29 AM","country":"Germany"},{"id":"TS021478286_CW08","caseNumber":"TS021478286","owner":"Sabari M","title":"02‑P JRS: CCM/RM/QM Project Areas Not Appearing in the Limit the Scope Selection","customerNumber":"284926","product":"Engineering Workflow Management","severity":"3","status":"Closed by IBM","age":"7 days","closedDate":"2/24/2026 2:43","category":"JRS / Reports","comments":"","created":"2/17/2026 12:16 AM","solutionDate":"2/18/2026 4:02 AM","country":"Germany"},{"id":"TS021504833_CW08","caseNumber":"TS021504833","owner":"Hareesh Gaddam","title":"ALM-14-P: RQM OSLC requests are taking 3 times longer","customerNumber":"284926","product":"Engineering Test Management","severity":"3","status":"Closed by IBM","age":"4 days","closedDate":"2/24/2026 7:09","category":"ETM / QM","comments":"","created":"2/19/2026 11:45 PM","solutionDate":"2/20/2026 5:35 AM","country":"Germany"}]}
};

/* ================================================================
   CATEGORY NORMALISATION MAP
   Maps legacy/inconsistent category values → canonical names.
   Any value not in this map is left as-is (or treated as blank).
   ================================================================ */
const _WT_CAT_NORM = {
  // New canonical names (self-mapping)
  "Issue Fixed in iFix":           "Issue Fixed in iFix",
  "LQE Validation / Reindexing":   "LQE Validation / Reindexing",
  "Export / Import Issues":        "Export / Import Issues",
  "Known Defect":                  "Known Defect",
  "Out of Memory / Heap Issues":   "Out of Memory / Heap Issues",
  "TRS Feed Validation":           "TRS Feed Validation",
  "Insufficient Information in Logs": "Insufficient Information in Logs",
  "Single Occurrence Issue":       "Single Occurrence Issue",
  "DCM Connectivity Issues":       "DCM Connectivity Issues",
  "Database Connectivity Issues":  "Database Connectivity Issues",
  "Backup & Restore":             "Backup & Restore",
  // Legacy → new mapping
  "Application Bug":              "Known Defect",
  "Defect / iFix":                "Issue Fixed in iFix",
  "Defect":                       "Known Defect",
  "TestFix":                      "Issue Fixed in iFix",
  "Known Defect":                 "Known Defect",
  "OOM / App Down":               "Out of Memory / Heap Issues",
  "OutOfMemory / JVM":            "Out of Memory / Heap Issues",
  "LQE / TRS Issue":              "LQE Validation / Reindexing",
  "LQE / LDX":                    "LQE Validation / Reindexing",
  "TRS Validation":               "TRS Feed Validation",
  "LQE Validation":               "LQE Validation / Reindexing",
  "LQE Validation ":              "LQE Validation / Reindexing",
  "Export / Import Issue":        "Export / Import Issues",
  "Database Issue":               "Database Connectivity Issues",
  "Database Connectivity Issues": "Database Connectivity Issues",
  "DCM Connectivity Issues":      "DCM Connectivity Issues",
  "CCM / Work Item":              "Known Defect",
  "DNG / RM":                     "Known Defect",
  "ETM / QM":                     "Known Defect",
  "JRS / Reports":                "Known Defect",
  "Performance / Slow":           "Known Defect",
  "CDCM":                         "DCM Connectivity Issues",
  "Configuration Issue":          "Known Defect",
  "Permission Issue":             "Single Occurrence Issue",
  "Authentication Issue":         "Single Occurrence Issue",
  "Liberty / IHS":                "Known Defect",
  "Upgrade / Rollout":            "Known Defect",
  "7.0.3":                        "Known Defect",
  "Query / General":              "Insufficient Information in Logs",
  "Reopen / No Response":         "Insufficient Information in Logs",
  "Reopen":                       "Insufficient Information in Logs",
  "Reopened":                     "Insufficient Information in Logs",
  "Query":                        "Insufficient Information in Logs",
  "Artifact":                     "Insufficient Information in Logs",
  "License":                      "Insufficient Information in Logs",
  "L3 Tool":                      "Insufficient Information in Logs",
  "Lack of logs":                 "Insufficient Information in Logs",
  "Standby":                      "Single Occurrence Issue",
  "Customer":                     "Insufficient Information in Logs",
  "Duplicate":            "General Issue",
  // Numeric / garbage — map to blank so user is prompted
  "109": "", "130": "", "135": "", "145": "", "149": "", "154": "",
  "163": "", "168": "", "171": "", "175": "", "179": "",
  "184": "", "192": "",
};

/* ================================================================
   WT_CATEGORIES — built dynamically from seed data + canonical list
   Always sorted; new categories added via data appear automatically.
   ================================================================ */
const WT_CATEGORIES = (() => {
  const CORE = [
    "Issue Fixed in iFix",
    "LQE Validation / Reindexing",
    "Export / Import Issues",
    "Known Defect",
    "Out of Memory / Heap Issues",
    "TRS Feed Validation",
    "Insufficient Information in Logs",
    "Single Occurrence Issue",
    "DCM Connectivity Issues",
    "Database Connectivity Issues",
    "Backup & Restore",
  ];
  const extra = new Set();
  // Scan seed data for any category values not already covered
  Object.values(_WT_SEED).forEach(yearData => {
    Object.values(yearData).forEach(week => {
      week.forEach(row => {
        const raw = (row.category || "").trim();
        if (!raw) return;
        const norm = _WT_CAT_NORM[raw] ?? raw;
        if (norm && !CORE.includes(norm)) extra.add(norm);
      });
    });
  });
  return [...new Set([...CORE, ...extra])].sort();
})();

/* ================================================================
   wtSuggestCategory — keyword-based auto-suggest
   Returns best matching category string or "" if no match.
   ================================================================ */
function wtSuggestCategory(title, comments) {
  const txt = ((title || "") + " " + (comments || "")).toLowerCase();
  const rules = [
    [/\boom|out.?of.?memory|heap|oome|garbage.collec|app.down|application.down|went.down|down.due/i, "Out of Memory / Heap Issues"],
    [/\blqe|ldx|compaction|reindex|lqers|datasource|data.source/i,                                   "LQE Validation / Reindexing"],
    [/\btrs.feed|trs.valid|skipped.resource/i,                                                       "TRS Feed Validation"],
    [/\bupgrad|rollout|migrat|7\.0\.3|7\.1|7\.2|repotools|jvm.*creat|jvmj9/i,                        "Known Defect"],
    [/\bliberty|ihs|httpd|websphere|wlp|ssl|certificate|config/i,                                    "Known Defect"],
    [/\bbackup|restore|recover/i,                                                                    "Backup & Restore"],
    [/\bexport|import|reqif|csv|xlsx|download|upload/i,                                              "Export / Import Issues"],
    [/\bdatabase|db|oracle|sql|jdbc|connection|dcm|connectivity/i,                                   "Database Connectivity Issues"],
    [/\bifix|testfix|dt\d{6}|known.issue|ki.dt|fixed|issue.fixed/i,                                  "Issue Fixed in iFix"],
    [/\bdefect|bug|error|exception|crash|slow|timeout|known.defect/i,                               "Known Defect"],
    [/\bquery|clarif|question|how.to|what.is|best.practic|reopen|no.response|no.reply/i,            "Insufficient Information in Logs"],
    [/\bpermission|access.denied|unauthorized|403|401|privilege|role/i,                             "Single Occurrence Issue"],
    [/\bauth|oauth|token|ldap|saml|login|sso|kerberos/i,                                            "Single Occurrence Issue"],
  ];
  for (const [re, cat] of rules) { if (re.test(txt)) return cat; }
  return "";
}

const DashWeeklyTracker = (() => {

  // On file://, use sessionStorage to avoid the empty-namespace isolation issue.

  const STORE_PREFIX  = "ibm_wtracker_";
  const HISTORY_KEY   = "ibm_wtracker_history";
  const SEEDED_KEY    = "ibm_wtracker_seeded_v5"; // v5: dedup + reopened history seeding
  const WTC_SERVER_KEY = "ibm_wtracker_comments_v1"; // server-side comments store key
  const LS_LINK_MAP_KEY = "ibm_wtracker_linkmap_v1"; // persisted paste-captured hyperlinks per case

  let _year        = new Date().getFullYear();
  let _currentWeek = null;
  let _editComment = null;
  let _activeTab   = "tracker"; // "tracker" | "history" | "reopened"
  let _sortCol     = "closedDate"; // FIX: default sort by Closed Date
  let _sortDir     = 1;            // 1 = asc, -1 = desc
  // Bulk selection state (#7)
  let _selectedRows = new Set();
  // Filter chip state — owner and category quick-filters
  let _filterOwner    = "";        // "" = no filter
  let _filterCategory = "";        // "" = no filter

  // ── Server-side comments store ────────────────────────────────────────────
  // Shape: { [caseNumber]: "comment text" }
  // This is the single source of truth for comments — never stored in localStorage.
  // Loaded once at render() time, saved back to server on every comment edit or import.
  let _serverComments = {};      // in-memory cache
  let _serverCommentsLoaded = false;

  const LS_CMT_KEY = "ibm_wtracker_comments_v1";

  // Public helper: ensures comments are loaded into memory.
  async function _ensureServerCommentsLoaded() {
    if (_serverCommentsLoaded) return;
    try {
      const raw = localStorage.getItem(LS_CMT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && !Array.isArray(parsed)) _serverComments = parsed;
      }
    } catch(e) {}
    _serverCommentsLoaded = true;
  }

  async function _loadServerComments() {
    await _ensureServerCommentsLoaded();
  }

  async function _saveServerComments() {
    try { localStorage.setItem(LS_CMT_KEY, JSON.stringify(_serverComments)); } catch(e) {}
  }

  // Merge an imported map (caseNumber → comment) into the server store.
  // Imported comments OVERWRITE existing ones for matching case numbers.
  // Used by legacy paths only — Admin Portal import now uses _mergeServerCommentsNoOverwrite.
  async function _mergeServerComments(importedMap) {
    let added = 0, updated = 0, unchanged = 0;
    Object.entries(importedMap).forEach(([cn, cmt]) => {
      if (_serverComments[cn] === undefined) { added++; }
      else if (_serverComments[cn] !== cmt)   { updated++; }
      else                                     { unchanged++; }
    });
    Object.assign(_serverComments, importedMap);
    await _saveServerComments();
    return { added, updated, unchanged };
  }

  // Safe merge: only fills in comments for cases that have NO existing comment.
  // Never overwrites. Used by the Admin Portal Excel import.
  async function _mergeServerCommentsNoOverwrite(newEntriesMap) {
    let added = 0;
    Object.entries(newEntriesMap).forEach(([cn, cmt]) => {
      const existing = _serverComments[cn];
      if (!existing || !existing.trim()) {
        _serverComments[cn] = cmt;
        added++;
      }
    });
    if (added > 0) await _saveServerComments();
    return { added };
  }

  /* ── Storage helpers (case/week data — not comments) ── */
  const _sk  = yr => STORE_PREFIX + yr;
  const _ldy = yr => { try { return JSON.parse(localStorage.getItem(_sk(yr)) || "{}"); } catch(e) { return {}; } };
  const _svy = (yr, d) => { try { localStorage.setItem(_sk(yr), JSON.stringify(d)); } catch(e) {} };

  // _wr: read rows for a week, overlaying server-side comments onto each row
  const _cleanCaseNum = s => (s || "").replace(/<[^>]*>/g, "").replace(/[⏱⚡]/g, "").trim();

  /* _buildUrlPreview: extract URLs and hyperlinks from text,
     render as a clickable links list for the popover "Links" panel.
     Detects three sources generically:
       1. Bare http/https URLs in plain text
       2. Any hyperlinked text captured via paste (stored in _pastedLinkMap)
       3. Bare TS/DT/PMR-style identifiers not already in _pastedLinkMap */
  function _buildUrlPreview(text) {
    if (!text) return "";
    const textLower = text.toLowerCase();

    // Source 1: bare URLs in plain text
    const rawUrls = [...new Set((text.match(/https?:\/\/[^\s<>"')\]]+/g) || []))];

    // Source 2: pasted hyperlinks whose label text appears in the textarea
    // _pastedLinkMap keys are lowercased label text → { label, href }
    const pastedItems = [];
    const pastedHrefs = new Set(); // track hrefs already added from paste map
    for (const [key, entry] of Object.entries(_pastedLinkMap)) {
      if (textLower.includes(key)) {
        pastedItems.push(entry);
        pastedHrefs.add(entry.href);
      }
    }

    // Source 3: bare identifier patterns not already covered by paste map
    // Generic pattern: 2+ uppercase letters followed by 5+ digits (e.g. TS019458021, DT445785, PMR12345)
    const identRe = /(?<![A-Za-z0-9])([A-Z]{2,}[\d]+)(?![A-Za-z0-9])/g;
    const bareIdents = [];
    let m;
    while ((m = identRe.exec(text)) !== null) {
      const token = m[1];
      // Only surface if NOT already in pasted map (pasted map is more precise — has the real URL)
      if (!_pastedLinkMap[token.toLowerCase()]) {
        bareIdents.push(token);
      }
    }
    const uniqueIdents = [...new Set(bareIdents)];

    // Filter bare URLs: skip any whose full URL is already in pastedHrefs
    const filteredUrls = rawUrls.filter(u => !pastedHrefs.has(u));

    if (!filteredUrls.length && !pastedItems.length && !uniqueIdents.length) return "";

    // Render pasted hyperlinks (most informative — real URLs known)
    const pastedHtml = pastedItems.map(({ label, href }) => {
      const display = label.length > 70 ? label.slice(0, 67) + "\u2026" : label;
      return `<a href="${Utils.escHtml(href)}" target="_blank" rel="noopener noreferrer"
        onclick="event.stopPropagation()"
        style="color:var(--ibm-blue-50);font-weight:600;text-decoration:underline;text-decoration-style:dotted;
          text-underline-offset:2px;word-break:break-all;transition:opacity var(--t-fast);display:block"
        onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"
        title="${Utils.escHtml(href)}">${Utils.escHtml(display)}</a>`;
    });

    // Render bare identifiers (no known URL — show as monospaced label only)
    const identHtml = uniqueIdents.map(token => {
      // Try to auto-resolve known IBM patterns to a URL
      let href = null;
      if (/^TS\d{8,}$/.test(token)) href = _IBM_CASE_BASE + token;
      const display = Utils.escHtml(token);
      if (href) {
        return `<a href="${Utils.escHtml(href)}" target="_blank" rel="noopener noreferrer"
          onclick="event.stopPropagation()"
          style="color:var(--ibm-blue-50);font-weight:600;text-decoration:underline;text-decoration-style:dotted;
            text-underline-offset:2px;font-family:var(--font-mono);transition:opacity var(--t-fast);display:block"
          onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"
          title="Open IBM Case ${display}">${display}</a>`;
      }
      // Unknown identifier — show as plain monospaced badge (dim; user knows it was linked)
      return `<span style="color:var(--ibm-blue-50);font-family:var(--font-mono);font-size:11px;
        opacity:.75;display:block" title="Linked identifier (URL not captured)">${display}</span>`;
    });

    // Render bare URLs
    const urlHtml = filteredUrls.map(u => {
      const display = u.length > 60 ? u.slice(0, 57) + "\u2026" : u;
      return `<a href="${Utils.escHtml(u)}" target="_blank" rel="noopener noreferrer"
        onclick="event.stopPropagation()"
        style="color:var(--ibm-blue-50);text-decoration:underline;text-decoration-style:dotted;
          text-underline-offset:2px;word-break:break-all;transition:opacity var(--t-fast);display:block"
        onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"
        title="${Utils.escHtml(u)}">${Utils.escHtml(display)}</a>`;
    });

    return [...pastedHtml, ...identHtml, ...urlHtml].join("");
  }


  /* _linkify: convert plain text to HTML with:
     1. http/https URLs → clickable links
     2. Bare TS case numbers (e.g. TS021544897) → IBM mysupport links
     Safe: escapes all non-link text via Utils.escHtml, never double-escapes. */
  const _IBM_CASE_BASE = "https://www.ibm.com/mysupport/s/case/";

  function _linkify(text) {
    if (!text) return "";
    // Combined regex: capture either a full URL or a bare TS case number
    const COMBINED_RE = /(https?:\/\/[^\s<>"')\]]+)|((?<![A-Za-z0-9])TS\d{8,}(?![A-Za-z0-9]))/g;
    let result = "";
    let lastIdx = 0;
    let match;
    while ((match = COMBINED_RE.exec(text)) !== null) {
      result += Utils.escHtml(text.slice(lastIdx, match.index));
      lastIdx = match.index + match[0].length;
      if (match[1]) {
        // Full URL
        const url = match[1];
        const display = url.length > 55 ? url.slice(0, 52) + "\u2026" : url;
        result += `<a href="${Utils.escHtml(url)}" target="_blank" rel="noopener noreferrer"
          onclick="event.stopPropagation()"
          style="color:var(--ibm-blue-50);text-decoration:underline;text-decoration-style:dotted;
            text-underline-offset:2px;word-break:break-all;transition:opacity var(--t-fast)"
          onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"
          title="${Utils.escHtml(url)}">${Utils.escHtml(display)}</a>`;
      } else if (match[2]) {
        // Bare TS case number → IBM mysupport link
        const cn = match[2];
        const url = _IBM_CASE_BASE + cn;
        result += `<a href="${Utils.escHtml(url)}" target="_blank" rel="noopener noreferrer"
          onclick="event.stopPropagation()"
          style="color:var(--ibm-blue-50);font-weight:600;text-decoration:underline;text-decoration-style:dotted;
            text-underline-offset:2px;font-family:var(--font-mono);transition:opacity var(--t-fast)"
          onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"
          title="Open IBM Case ${Utils.escHtml(cn)}">${Utils.escHtml(cn)}</a>`;
      }
    }
    result += Utils.escHtml(text.slice(lastIdx));
    return result;
  }


  const _wr  = (yr, wk) => {
    const rows = _ldy(yr)[wk] || [];
    return rows.map(r => {
      const cleanCN = _cleanCaseNum(r.caseNumber);
      const sc = _serverComments[cleanCN] ?? _serverComments[r.caseNumber];
      const base = cleanCN !== r.caseNumber ? { ...r, caseNumber: cleanCN } : r;
      const withComments = (sc !== undefined) ? { ...base, comments: sc } : base;
      // Apply Admin Portal owner override if present (_ownerOverride set by reassignCase)
      const liveCases = (typeof Data !== 'undefined' && Data.allCases) ? Data.allCases() : [];
      const liveCase = liveCases.find(c => c["Case Number"] === cleanCN || c["Case Number"] === r.caseNumber);
      if (liveCase && liveCase._ownerOverride) {
        return { ...withComments, owner: Data.displayName(liveCase.Owner) };
      }
      return withComments;
    });
  };

  // _swk: write rows for a week — strips comments before storing (comments live server-side)
  const _swk = (yr, wk, rows) => {
    const stripped = rows.map(r => { const { comments: _c, ...rest } = r; return { ...rest, comments: "" }; });
    const a = _ldy(yr);
    if (rows.length) a[wk] = stripped; else delete a[wk];
    _svy(yr, a);
  };

  /* ── History storage ── */
  function _loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"); } catch(e) { return {}; } }
  function _saveHistory(h) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch(e) {} }

  function _recordHistory(caseNumber, owner, statusBefore, statusAfter, commentBefore, commentAfter, week, year, availabilityFlag) {
    const h = _loadHistory();
    if (!h[caseNumber]) h[caseNumber] = { caseNumber, owner, entries: [] };
    h[caseNumber].owner = owner; // keep latest
    const entry = {
      ts: new Date().toISOString(),
      week, year,
      statusBefore, statusAfter,
      commentBefore, commentAfter,
      changedBy: "user"
    };
    if (availabilityFlag) entry.availability = availabilityFlag;
    h[caseNumber].entries.unshift(entry);
    // Cap at 50 entries per case
    if (h[caseNumber].entries.length > 50) h[caseNumber].entries = h[caseNumber].entries.slice(0, 50);
    _saveHistory(h);
  }

  /* ── Normalise a category value using the map ── */
  function _normCat(raw) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed in _WT_CAT_NORM) return _WT_CAT_NORM[trimmed];
    return WT_CATEGORIES.includes(trimmed) ? trimmed : trimmed;
  }

  /* ── Deduplicate all weeks: keep first occurrence of each caseNumber per week ── */
  function _deduplicateAllWeeks() {
    let totalRemoved = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(STORE_PREFIX)) continue;
      const yr = parseInt(k.replace(STORE_PREFIX, ""), 10);
      if (isNaN(yr)) continue;
      const yearData = _ldy(yr);
      let changed = false;
      Object.keys(yearData).forEach(wk => {
        const rows = yearData[wk] || [];
        const seen = new Set();
        const deduped = rows.filter(r => {
          if (seen.has(r.caseNumber)) { changed = true; totalRemoved++; return false; }
          seen.add(r.caseNumber);
          return true;
        });
        if (changed) yearData[wk] = deduped;
      });
      if (changed) _svy(yr, yearData);
    }
    return totalRemoved;
  }

  /* ── Seed reopened-case history from cross-week seed data ── */
  function _seedReopenedHistory() {
    const h = _loadHistory();
    let changed = false;
    // Scan seed data for cases appearing in multiple weeks (reopened cases)
    Object.entries(_WT_SEED).forEach(([yr, weeks]) => {
      const caseWeeks = {};
      Object.entries(weeks).forEach(([wk, rows]) => {
        rows.forEach(row => {
          if (!caseWeeks[row.caseNumber]) caseWeeks[row.caseNumber] = [];
          caseWeeks[row.caseNumber].push({ wk, row });
        });
      });
      Object.entries(caseWeeks).forEach(([cn, appearances]) => {
        if (appearances.length < 2) return; // not reopened
        // Sort by week to process in order
        appearances.sort((a, b) => a.wk.localeCompare(b.wk));
        if (!h[cn]) { h[cn] = { caseNumber: cn, owner: appearances[0].row.owner, entries: [] }; changed = true; }
        // Add a history entry for each reopening (2nd+ appearance)
        for (let i = 1; i < appearances.length; i++) {
          const prev = appearances[i - 1];
          const curr = appearances[i];
          const entryId = `seed_reopen_${cn}_${curr.wk}`;
          // Don't add duplicates if already seeded
          if (h[cn].entries.some(e => e._seedId === entryId)) continue;
          h[cn].owner = curr.row.owner;
          h[cn].entries.push({
            _seedId: entryId,
            ts: (() => { try { const d = new Date(curr.row.closedDate || Date.now()); return isNaN(d) ? new Date().toISOString() : d.toISOString(); } catch(e) { return new Date().toISOString(); } })(),
            week: curr.wk,
            year: parseInt(yr),
            statusBefore: prev.row.status,
            statusAfter: curr.row.status,
            commentBefore: prev.row.comments || "",
            commentAfter: curr.row.comments || "",
            changedBy: "reopened",
            isReopen: true,
            prevWeek: prev.wk
          });
          changed = true;
        }
        if (h[cn].entries.length > 50) h[cn].entries = h[cn].entries.slice(0, 50);
      });
    });
    if (changed) _saveHistory(h);
  }

  /* ── One-time seed ── */
  function _applySeed() {
    // v5: dedup + seed reopened history on first run
    const seeded = localStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      ["2025","2026"].forEach(yr => {
        const seedData = _WT_SEED[yr] || {};
        const existing = _ldy(parseInt(yr));
        Object.entries(seedData).forEach(([wk, rows]) => {
          if (!existing[wk] || !existing[wk].length) {
            existing[wk] = rows.map(r => ({ ...r, category: _normCat(r.category) }));
          }
        });
        _svy(parseInt(yr), existing);
      });
      // Clean any same-week duplicates from existing or imported data
      _deduplicateAllWeeks();
      // Seed history for reopened cases detected in seed data
      _seedReopenedHistory();
      localStorage.setItem(SEEDED_KEY, "1");
    }
    // Force-fix 2025: if existing 2025 data has no comments AND came only from the seed
    // (not from enrichFromCases / CSV upload), replace with correct seed to restore comments.
    // Guard: skip if data has MORE weeks than the seed (enrichFromCases has already run)
    // or if any row has _fromCSV flag (CSV-sourced rows have no comments by design).
    const data25 = _ldy(2025);
    const allRows25 = Object.values(data25).flat();
    const hasComments = allRows25.some(r => r && r.comments && r.comments.trim());
    const hasCsvRows  = allRows25.some(r => r && r._fromCSV);
    const seedWeeks25 = Object.keys(_WT_SEED["2025"] || {}).length;
    const storedWeeks25 = Object.keys(data25).length;
    // Only apply force-fix when: no comments, no CSV rows, and not more weeks than seed
    if (!hasComments && !hasCsvRows && allRows25.length > 0 && storedWeeks25 <= seedWeeks25) {
      const seedData = _WT_SEED["2025"] || {};
      const fresh = {};
      Object.entries(seedData).forEach(([wk, rows]) => {
        const stored = data25[wk] || [];
        const byCase = {};
        stored.forEach(r => { byCase[r.caseNumber] = r; });
        fresh[wk] = rows.map(r => {
          const s = byCase[r.caseNumber] || {};
          return { ...r, comments: (s.comments && s.comments.trim()) ? s.comments : r.comments };
        });
      });
      _svy(2025, fresh);
    }

    // Migrate seed-embedded comments into _serverComments for any case that
    // has no existing entry. Runs every render so already-stripped comments
    // are recovered after a CSV re-upload cleared them.
    let _seedMigrated = false;
    ["2025","2026"].forEach(yr => {
      const seedData = _WT_SEED[yr] || {};
      Object.values(seedData).forEach(rows => {
        rows.forEach(r => {
          if (r.comments && r.comments.trim() && _serverComments[r.caseNumber] === undefined) {
            _serverComments[r.caseNumber] = r.comments;
            _seedMigrated = true;
          }
        });
      });
    });
    if (_seedMigrated) _saveServerComments();
  }

  /* ── Enrich from main IBM cases CSV ── */
  function enrichFromCases(allCases) {
    if (!allCases || !allCases.length) return;
    const byYW = {};
    allCases.forEach(r => {
      if (!Data.isTeamOwner(r.Owner)) return;
      const closedStr = (r["Closed Date"] || "").trim();
      if (!closedStr) return;
      const d = Utils.parseDate(closedStr);
      if (!d) return;
      const yr = d.getFullYear();
      const wk = _isoWeek(d);
      const key = yr + "_" + wk;
      if (!byYW[key]) byYW[key] = { yr, wk, rows: [] };
      // Check if this case has been reassigned via Admin Portal (_ownerOverride)
      const _caseNum = _cleanCaseNum(r["Case Number"] || "");
      const _liveCase = (Data.allCases ? Data.allCases() : []).find(c => c["Case Number"] === r["Case Number"] || c["Case Number"] === _caseNum);
      const _effectiveOwner = (_liveCase && _liveCase._ownerOverride) ? _liveCase.Owner : r.Owner;
      byYW[key].rows.push({
        id: _caseNum + "_" + wk,
        caseNumber: _caseNum,
        owner: Data.displayName(_effectiveOwner || ""),
        title: r.Title || "",
        customerNumber: (r["Customer number"] || "").replace(/^0+/,""),
        product: r.Product || "",
        severity: r.Severity || "",
        status: r.Status || "",
        age: r.Age || "",
        closedDate: closedStr,
        created: r.Created || "",
        solutionDate: r["Solution date"] || "",
        comments: "", category: "",
        _fromCSV: true
      });
    });

    // Build previous state snapshot before merging (for reopened detection)
    const prevState = {};
    Object.entries(_ldy(2025)).forEach(([wk, rows]) => {
      rows.forEach(r => {
        if (r && r.caseNumber && !prevState[r.caseNumber]) {
          prevState[r.caseNumber] = { status: r.status, owner: r.owner, week: wk };
        }
      });
    });
    Object.entries(_ldy(2026)).forEach(([wk, rows]) => {
      rows.forEach(r => {
        if (r && r.caseNumber && !prevState[r.caseNumber]) {
          prevState[r.caseNumber] = { status: r.status, owner: r.owner, week: wk };
        }
      });
    });

    let _commentsMigrated = false;
    const reopened = [];
    Object.values(byYW).forEach(({ yr, wk, rows }) => {
      const stored = _wr(yr, wk);
      const byCase = {};
      stored.forEach(r => { byCase[r.caseNumber] = r; });
      const merged = rows.map(r => {
        const s = byCase[r.caseNumber] || {};
        // Server-side comments take priority; fall back to any stored comment
        const serverCmt = _serverComments[r.caseNumber];
        const comment   = (serverCmt !== undefined) ? serverCmt : (s.comments || "");
        // Migrate seed/stored comments into _serverComments so _swk stripping doesn't erase them
        if (serverCmt === undefined && comment) {
          _serverComments[r.caseNumber] = comment;
          _commentsMigrated = true;
        }
        // Track reopened cases: if status was "Closed" and now active
        const prev = prevState[r.caseNumber];
        if (prev && Utils.isClosed(prev.status) && !Utils.isClosed(r.status)) {
          reopened.push({ caseNumber: r.caseNumber, owner: r.owner, statusBefore: prev.status, statusAfter: r.status, previousWeek: prev.week, currentWeek: wk });
        }
        return { ...r, comments: comment, category: s.category||"", owner: r.owner||s.owner, availability: s.availability||"" };
      });
      stored.forEach(s => { if (!merged.find(m => m.caseNumber === s.caseNumber)) merged.push(s); });
      // Dedup guard: keep only first occurrence of each caseNumber in this week
      const seenCases = new Set();
      const deduped = merged.filter(r => {
        if (seenCases.has(r.caseNumber)) return false;
        seenCases.add(r.caseNumber);
        return true;
      });
      _swk(yr, wk, deduped);
    });
    // Persist any comments rescued from seed data before _swk could strip them
    if (_commentsMigrated) _saveServerComments();

    // Add reopened cases to history
    if (reopened.length > 0) {
      const h = _loadHistory();
      reopened.forEach(r => {
        if (!h[r.caseNumber]) h[r.caseNumber] = { caseNumber: r.caseNumber, owner: r.owner, entries: [] };
        h[r.caseNumber].entries.push({
          ts: new Date().toISOString(),
          week: r.currentWeek,
          statusBefore: r.statusBefore,
          statusAfter: r.statusAfter,
          changedBy: "csv-upload",
          isReopen: true,
          prevWeek: r.previousWeek
        });
      });
      _saveHistory(h);
    }

    try { const el=document.getElementById("tab-weekly-tracker"); if(el&&el.classList.contains("active")) render(); } catch(e) {}
  }

  function _isoWeek(d) {
    // Sunday-based week numbering, W01 = week containing Jan 1
    const yr = d.getFullYear();
    const jan1 = new Date(yr, 0, 1);
    const jan1Day = jan1.getDay(); // 0=Sun
    // Sunday on or before Jan 1 = start of W01
    const w1Sun = new Date(jan1);
    w1Sun.setDate(jan1.getDate() - jan1Day);
    const target = new Date(yr, d.getMonth(), d.getDate());
    if (target < w1Sun) {
      // Before W01 of this year — belongs to last week of previous year
      return _isoWeek(new Date(yr - 1, 11, 31));
    }
    const wk = Math.floor((target - w1Sun) / (7 * 86400000)) + 1;
    return "CW" + String(wk).padStart(2, "0");
  }

  function _buildWeeks(yr) {
    const weeks = [];
    const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const pad = n => String(n).padStart(2, "0");
    // Find the first Sunday of the year (Jan 1 if it's Sunday, otherwise next Sunday)
    const jan1 = new Date(yr, 0, 1);
    const jan1Day = jan1.getDay(); // 0=Sun
    const firstSun = new Date(jan1);
    if (jan1Day !== 0) firstSun.setDate(jan1.getDate() + (7 - jan1Day));
    // Also include the partial week before firstSun if Jan 1 isn't Sunday
    // Start from the Sunday on or before Jan 1
    const sun = new Date(jan1);
    sun.setDate(jan1.getDate() - jan1Day);
    let cw = 1;
    for (let i = 0; i < 54; i++) {
      const s = new Date(sun), e = new Date(sun);
      e.setDate(sun.getDate() + 6);
      // Stop if entire week is past this year
      if (s.getFullYear() > yr) break;
      // If the week starts in previous year but ends in current year, include as W01 partial
      // If the week starts in current year, include normally
      if (s.getFullYear() === yr || e.getFullYear() === yr) {
        // Use the Sunday start date for label — if it's in prev year, still label with Jan
        const labelDate = s.getFullYear() === yr ? s : new Date(yr, 0, 1);
        weeks.push({
          key: "CW" + pad(cw),
          label: MN[s.getFullYear() === yr ? s.getMonth() : 0] + " W" + pad(cw) + " (" + (s.getFullYear() === yr ? s.getDate() : 1) + "-" + e.getDate() + ")",
          range: (s.getFullYear() === yr ? s.getDate() : 1) + " " + MN[s.getFullYear() === yr ? s.getMonth() : 0] + " \u2013 " + e.getDate() + " " + MN[e.getMonth()] + " " + e.getFullYear(),
          isoStart: s.toISOString().split("T")[0], isoEnd: e.toISOString().split("T")[0], month: e.getMonth()
        });
        cw++;
      }
      sun.setDate(sun.getDate() + 7);
    }
    return weeks;
  }

  function _curCW(weeks) {
    const today = new Date().toISOString().split("T")[0];
    return (weeks.find(w => today >= w.isoStart && today <= w.isoEnd) || weeks[0]).key;
  }

  function _yearsAvail() {
    const s = new Set([new Date().getFullYear()]);
    // 1. Derive years from actual CSV data (Created + Closed Date columns) — source of truth
    try {
      const all = Data.allCases();
      all.forEach(r => {
        ["Created", "Closed Date"].forEach(col => {
          const v = (r[col] || "").trim();
          if (!v) return;
          const d = Utils.parseDate(v);
          if (d && !isNaN(d)) s.add(d.getFullYear());
        });
      });
    } catch(e) { /* Data not loaded yet — fall through to localStorage */ }
    // 2. Also include any years that have tracker data in storage
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORE_PREFIX)) {
        const y = parseInt(k.replace(STORE_PREFIX, ""), 10);
        if (!isNaN(y)) s.add(y);
      }
    }
    // 3. Always include seed data years as fallback
    Object.keys(_WT_SEED).forEach(y => s.add(parseInt(y, 10)));
    return [...s].sort();
  }

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  function render() {
    const el = document.getElementById("tab-weekly-tracker");
    if (!el) return;
    // Load server-side comments first (async), then paint.
    // On subsequent renders the in-memory cache is used instantly.
    if (!_serverCommentsLoaded) {
      // Show skeleton immediately so the panel feels responsive
      el.innerHTML = `<div style="padding:24px 20px">
        <div style="display:flex;gap:12px;margin-bottom:16px">
          ${[120,80,100,60].map(w=>`<div style="height:28px;width:${w}px;border-radius:var(--radius-sm);background:var(--border-subtle);animation:wt-pulse 1.2s ease-in-out infinite"></div>`).join('')}
        </div>
        ${[1,2,3,4,5,6].map(()=>`<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
          <div style="height:18px;width:110px;border-radius:var(--radius-xs);background:var(--border-subtle);animation:wt-pulse 1.2s ease-in-out infinite"></div>
          <div style="height:18px;flex:1;border-radius:var(--radius-xs);background:var(--border-subtle);animation:wt-pulse 1.2s ease-in-out infinite;opacity:.7"></div>
          <div style="height:18px;width:70px;border-radius:var(--radius-xs);background:var(--border-subtle);animation:wt-pulse 1.2s ease-in-out infinite;opacity:.5"></div>
        </div>`).join('')}
        <style>@keyframes wt-pulse{0%,100%{opacity:.4}50%{opacity:1}}</style>
      </div>`;
      _loadServerComments().then(() => _renderInner(el)).catch(() => _renderInner(el));
    } else {
      _renderInner(el);
    }
  }

  function _renderInner(el) {
    _applySeed();
    const weeks = _buildWeeks(_year);
    if (!_currentWeek || !weeks.find(w => w.key === _currentWeek)) _currentWeek = _curCW(weeks);
    const years = _yearsAvail();

    el.innerHTML = `
      <div style="display:flex;flex-direction:column;height:calc(100vh - 112px);overflow:hidden">

        <!-- TOP: Tab bar + Year selector + compact nav strip -->
        <div style="flex-shrink:0;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle)">

          <!-- Row 1: Tabs + Year -->
          <div style="display:flex;align-items:center;padding:0 16px;gap:0;border-bottom:1px solid var(--border-subtle)">
            <div style="display:flex;align-items:center;gap:6px;padding:6px 12px 6px 0;border-right:1px solid var(--border-subtle);margin-right:10px">
              <label style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);white-space:nowrap">Year</label>
              <select id="wt-year-sel" class="form-input form-input-sm" style="width:76px;font-family:var(--font-mono);font-weight:600;font-size:12px;height:26px"
                onchange="DashWeeklyTracker._setYear(parseInt(this.value))">
                ${years.map(y => `<option value="${y}" ${y===_year?"selected":""}>${y}</option>`).join("")}
              </select>
            </div>
            ${["tracker","reopened","history"].map(t => {
              const label = t==="history"?"⏱ History":t==="reopened"?"↺ Reopened":"📋 Tracker";
              const isActive = _activeTab===t;
              return `<button onclick="DashWeeklyTracker._switchTab('${t}')" style="
                padding:10px 14px;font-size:12px;font-weight:${isActive?700:500};
                border:none;border-bottom:2px solid ${isActive?"var(--blue)":"transparent"};
                background:none;color:${isActive?"var(--blue)":"var(--text-secondary)"};
                cursor:pointer;white-space:nowrap;font-family:inherit;margin-bottom:-1px
              ">${label}</button>`;
            }).join("")}
          </div>

          <!-- Row 2: Compact month+week strip (tracker only) -->
          <div id="wt-nav-strip" style="display:${_activeTab==="tracker"?"flex":"none"};align-items:center;gap:0;overflow-x:auto;padding:0;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle);min-height:36px">
            <div id="wt-week-list" style="display:flex;flex-direction:row;align-items:stretch;gap:0;white-space:nowrap;padding:0 8px;flex:1"></div>
            <div style="flex-shrink:0;padding:0 10px;border-left:1px solid var(--border-subtle);display:flex;align-items:center;height:36px">
              <button id="wt-today-btn" onclick="DashWeeklyTracker._jumpToToday()" title="Jump to current week"
                style="font-size:10px;font-weight:600;padding:4px 10px;border-radius:var(--radius-sm);border:1.5px solid var(--ibm-blue-50);background:rgba(15,98,254,.09);color:var(--ibm-blue-50);cursor:pointer;white-space:nowrap;transition:all var(--t-fast);letter-spacing:.03em;line-height:1.4"
                onmouseover="this.style.background='rgba(15,98,254,.2)'" onmouseout="this.style.background='rgba(15,98,254,.09)'">⟲ Today</button>
            </div>
          </div>

          <!-- Row 2 history search -->
          <div id="wt-hist-strip" style="display:${_activeTab==="history"?"flex":"none"};align-items:center;gap:8px;padding:6px 14px;background:var(--surface-1)">
            <input type="text" id="wt-hist-search" class="search-input" placeholder="Search case, owner…" class="w-220"/>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none;font-size:11px;color:var(--text-secondary)">
              <input type="checkbox" id="wt-hist-hide-empty" onchange="DashWeeklyTracker._renderHistoryFiltered()" class="cursor-p" width="14" height="14">
              Hide empty entries
            </label>
            <div class="flex-1"></div>
            <button class="btn btn-secondary btn-sm" id="wt-hist-export-csv-btn" title="Export history as CSV spreadsheet" class="row-4-fs11">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              CSV
            </button>
            <button class="btn btn-secondary btn-sm" id="wt-hist-export-btn" title="Export history to JSON file" class="row-4-fs11">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              JSON
            </button>
            <button class="btn btn-secondary btn-sm" id="wt-hist-import-btn" title="Import history from JSON file" class="row-4-fs11">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import
            </button>
            <button class="btn btn-danger btn-sm" id="wt-hist-reset-btn" title="Clear all history permanently" class="row-4-fs11">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Reset
            </button>
          </div>
        </div>

        <!-- MAIN: full-width content -->
        <div style="flex:1;overflow-y:auto;padding:14px 18px;min-width:0">
          <div id="wt-tracker-panel" style="display:${_activeTab==="tracker"?"block":"none"}">
            <!-- Week title + actions -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px;flex-wrap:wrap">
              <div>
                <div id="wt-week-title" style="font-size:15px;font-weight:700;color:var(--text-primary);letter-spacing:-.2px"></div>
                <div id="wt-week-range" style="font-size:11px;color:var(--text-tertiary);margin-top:1px;font-family:var(--font-mono)"></div>
              </div>
              <div class="d-flex gap-8 flex-wrap">
                <button class="btn btn-secondary btn-sm" id="wt-export-year-btn" title="Export all cases for the entire year — one sheet per week">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Year Excel
                </button>
              </div>
            </div>
            <div id="wt-kpi" style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap"></div>
            <div id="wt-followup-panel" class="mb-10"></div>
            <div id="wt-bulk-bar" style="display:none;align-items:center;gap:8px;padding:7px 12px;background:rgba(15,98,254,.06);border:1px solid rgba(15,98,254,.2);border-radius:var(--radius-md);margin-bottom:8px;flex-wrap:wrap">
              <span id="wt-bulk-count" style="font-size:11px;font-weight:600;color:var(--ibm-blue-50);min-width:70px"></span>
              <span class="text-10 text-muted">Set for all selected:</span>
              <select id="wt-bulk-cat" class="form-input form-input-sm" style="font-size:11px;width:170px" onchange="DashWeeklyTracker._bulkSetCat(this.value);this.value=''">
                <option value="">Category…</option>
                ${WT_CATEGORIES.map(cat=>`<option value="${cat}">${cat}</option>`).join("")}
              </select>
              <select id="wt-bulk-av" class="form-input form-input-sm" style="font-size:11px;width:140px" onchange="DashWeeklyTracker._bulkSetAv(this.value);this.value=''">
                <option value="">Availability…</option>
                <option value="Attended">✓ Attended</option>
                <option value="Not Joined">✗ Not Joined</option>
                <option value="On Leave">◌ On Leave</option>
                <option value="Follow Up">→ Follow Up</option>
                <option value="Reopen">↻ Reopen</option>
                <option value="Reopened">↺ Reopen</option>
              </select>
              <button class="btn btn-ghost btn-sm" onclick="DashWeeklyTracker._clearBulk()" style="margin-left:auto;font-size:11px">✕ Clear selection</button>
            </div>
            <div class="tile" style="padding:0;overflow:hidden">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border-subtle);gap:10px;flex-wrap:wrap">
                <input type="text" id="wt-search" class="search-input" placeholder="Search cases, owner, category…" style="width:200px"/>
                <div id="wt-filter-chips" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;flex:1"></div>
                <span id="wt-row-count" style="font-size:11px;color:var(--text-tertiary);font-family:var(--font-mono);flex-shrink:0"></span>
              </div>
              <div id="wt-table-wrap" style="overflow-x:auto;overflow-y:auto;max-height:calc(100vh - 320px)"></div>
            </div>
          </div>

          <div id="wt-reopened-panel" style="display:${_activeTab==="reopened"?"block":"none"}"></div>
          <div id="wt-history-panel" style="display:${_activeTab==="history"?"block":"none"}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:10px;flex-wrap:wrap">
              <div>
                <div style="font-size:15px;font-weight:700;color:var(--text-primary)">Case History</div>
                <div class="text-11 text-muted mt-6">Tracks status and comment changes — useful when cases are reopened</div>
              </div>
              <button onclick="DashWeeklyTracker._switchTab('tracker');DashWeeklyTracker._jumpToToday();"
                style="flex-shrink:0;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;
                  padding:6px 14px;border-radius:var(--radius-sm);border:1.5px solid var(--ibm-blue-50);background:rgba(15,98,254,.08);
                  color:var(--ibm-blue-50);cursor:pointer;transition:all var(--t-fast);white-space:nowrap"
                onmouseover="this.style.background='rgba(15,98,254,.18)'" onmouseout="this.style.background='rgba(15,98,254,.08)'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                ← Back to this week
              </button>
            </div>
            <div id="wt-history-content"></div>
          </div>
          ${Data.isAdmin() ? `
          <!-- Danger Zone -->
          <div style="margin-top:24px;border:1.5px solid rgba(220,53,69,.35);border-radius:var(--radius-md);padding:16px 18px;background:rgba(220,53,69,.04)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--red)">Danger Zone</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm)">
              <div>
                <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary)">Clear All Case History</div>
                <div class="text-11 text-muted mt-6">Permanently removes all history entries for all users and weeks. Cannot be undone.</div>
              </div>
              <button id="wt-clear-history-btn" class="btn btn-danger btn-sm" style="flex-shrink:0;margin-left:16px" title="Admin: permanently delete all history entries">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Clear All History
              </button>
            </div>
          </div>` : ""}
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div id="wt-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:600;align-items:center;justify-content:center">
        <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:24px;width:640px;max-width:95vw;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.4)">
          <div id="wt-mtitle" style="font-size:15px;font-weight:700;margin-bottom:18px">Add Closed Case</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group"><label class="form-label">Case Owner *</label><select id="wm-owner" class="form-input form-input-sm"></select></div>
            <div class="form-group"><label class="form-label">Case Number *</label><input id="wm-cn" class="form-input form-input-sm" placeholder="TS0…"/></div>
            <div class="form-group" style="grid-column:1/-1"><label class="form-label">Title *</label><input id="wm-title" class="form-input form-input-sm"/></div>
            <div class="form-group"><label class="form-label">Product</label><input id="wm-prod" class="form-input form-input-sm"/></div>
            <div class="form-group"><label class="form-label">Severity</label>
              <select id="wm-sev" class="form-input form-input-sm">
                <option value="">—</option><option value="1">1 – Critical</option><option value="2">2 – Significant</option><option value="3">3 – Moderate</option><option value="4">4 – Minor</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Status</label><input id="wm-status" class="form-input form-input-sm" value="Closed by IBM"/></div>
            <div class="form-group"><label class="form-label">Age</label><input id="wm-age" class="form-input form-input-sm" placeholder="e.g. 14 days"/></div>
            <div class="form-group"><label class="form-label">Closed Date</label><input id="wm-closed" type="date" class="form-input form-input-sm"/></div>
            <div class="form-group" style="grid-column:1/-1">
              <label class="form-label">Category <span id="wm-cat-suggest" style="font-size:10px;color:var(--blue);margin-left:6px;cursor:pointer"></span></label>
              <select id="wm-cat" class="form-input form-input-sm">
                <option value="">— Select category —</option>
                ${WT_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label class="form-label">Update / Comments <span style="color:var(--text-tertiary);font-weight:400">(team notes)</span></label>
              <textarea id="wm-cmt" class="form-input form-input-sm" rows="3" style="resize:vertical"></textarea>
            </div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
            <button class="btn btn-ghost btn-sm" id="wt-mcancel">Cancel</button>
            <button class="btn btn-primary btn-sm" id="wt-msave">Add Case</button>
          </div>
        </div>
      </div>
    `;

    _renderWeekNav(weeks);
    _renderContent(weeks);
    _bindEvents(weeks);
    if (_activeTab === "history")  _renderHistory();
    if (_activeTab === "reopened") _renderReopened();
  }

  /* ── Week nav (compact horizontal strip) ── */
  function _renderWeekNav(weeks) {
    const list = document.getElementById("wt-week-list"); if (!list) return;
    const allData = _ldy(_year);
    const MS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    // Group weeks by month
    const groups = {};
    weeks.forEach(w => {
      if (!groups[w.month]) groups[w.month] = [];
      groups[w.month].push(w);
    });
    let html = "";
    Object.entries(groups).forEach(([mo, wks]) => {
      // Month label pill
      html += `<div style="display:flex;align-items:center;padding:0 4px 0 8px;flex-shrink:0">
        <span style="font-size:9px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-disabled);white-space:nowrap;padding-right:4px;border-right:1px solid var(--border-subtle)">${MS[mo]}</span>
      </div>`;
      wks.forEach(w => {
        const cnt = (allData[w.key]||[]).length;
        const active = w.key === _currentWeek;
        const isCurrentWeek = w.key === _curCW(weeks);
        const label = w.label;
        // Style: blue fill = selected, amber border = today's week (may differ if user browsed away)
        const _nbBg    = active ? "var(--chart-1)" : "transparent";
        const _nbColor = active ? "#fff" : (cnt>0?"var(--text-primary)":"var(--text-tertiary)");
        const _nbFw    = active ? 700 : (isCurrentWeek ? 600 : (cnt>0?600:400));
        const _nbBorder= active ? "2px solid var(--ibm-blue-50)" : isCurrentWeek ? "2px solid var(--yellow)" : "1px solid transparent";
        const _nbShad  = active ? "0 1px 4px rgba(15,98,254,.35)" : isCurrentWeek ? "0 0 0 2px rgba(245,158,11,.18)" : "none";
        const _nbTitle = isCurrentWeek && !active ? " (Current week)" : "";
        html += `<button class="wt-nb" data-wk="${w.key}" onclick="DashWeeklyTracker._navClick('${w.key}')" title="${w.range}${_nbTitle}"
          style="flex-shrink:0;border:none;cursor:pointer;padding:5px 9px;margin:3px 2px;border-radius:var(--radius-sm);
            background:${_nbBg};
            color:${_nbColor};
            font-size:10px;font-family:var(--font-mono);font-weight:${_nbFw};
            display:inline-flex;align-items:center;gap:4px;white-space:nowrap;
            border:${_nbBorder};transition:all var(--t-fast);
            box-shadow:${_nbShad}"
          onmouseover="if(this.dataset.wk!=='${_currentWeek}'){this.style.background='var(--bg-hover)';}"
          onmouseout="if(this.dataset.wk!=='${_currentWeek}'){this.style.background='transparent';}"
        >${label}${isCurrentWeek&&!active?'<span style="font-size:8px;vertical-align:middle;margin-left:1px" title="This week">●</span>':''}${cnt>0?`<span style="font-size:9px;font-weight:600;padding:0 4px;border-radius:var(--radius-md);background:${active?"rgba(255,255,255,.28)":"rgba(15,98,254,.14)"};color:${active?"#fff":"var(--chart-1)"};min-width:14px;text-align:center;line-height:16px">${cnt}</span>`:""}</button>`;
      });
    });
    list.innerHTML = html;
    setTimeout(() => {
      const ab = list.querySelector(`.wt-nb[data-wk="${_currentWeek}"]`);
      if (ab) ab.scrollIntoView({ inline: "center", block: "nearest" });
    }, 50);
  }


  function _renderContent(weeks) {
    const w = weeks.find(x => x.key === _currentWeek); if (!w) return;
    document.getElementById("wt-week-title").textContent = _year + "  \u00B7  " + w.label;
    document.getElementById("wt-week-range").textContent  = w.range;
    _renderKPI(); _renderFollowUp(); _renderTable(weeks);
  }

  /* ── Follow-up panel: collapsible with badge count, grouped by case number ── */
  let _followupOpen = true;
  function _renderFollowUp() {
    const el = document.getElementById("wt-followup-panel"); if (!el) return;
    const allData = _ldy(_year);

    // Build team member set for filtering
    const _fupTeamSet = (() => {
      try {
        const m = (typeof DynamicConfig !== "undefined" && DynamicConfig.teamMembers)
          ? DynamicConfig.teamMembers()
          : (typeof AppData !== "undefined" ? AppData.teamMembers : []);
        return m.length ? new Set(m.map(n => n.toLowerCase())) : null;
      } catch(e) { return null; }
    })();

    // Collect all unresolved entries — team members only
    const needsAttention = [];
    Object.entries(allData).forEach(([wk, rows]) => {
      (rows||[]).forEach(r => {
        // Skip non-team-member rows
        if (_fupTeamSet && _fupTeamSet.size && !_fupTeamSet.has((r.owner||"").toLowerCase())) return;
        const av = r.availability || "";
        if (["Not Joined","On Leave","Follow Up","Reopened"].includes(av)) {
          if (!(r.comments && r.comments.trim())) {
            needsAttention.push({ ...r, _week: wk });
          }
        }
      });
    });
    if (!needsAttention.length) { el.innerHTML = ""; return; }

    // ── Group by case number ──────────────────────────────────────────
    const grouped = new Map(); // caseNumber → { entries[], owner, title, latestAv, latestWeek }
    needsAttention.sort((a,b) => a._week.localeCompare(b._week)).forEach(r => {
      const key = r.caseNumber || (r.owner + "|" + r.title); // fallback if no case number
      if (!grouped.has(key)) {
        grouped.set(key, { caseNumber: r.caseNumber, owner: r.owner, title: r.title, entries: [] });
      }
      grouped.get(key).entries.push({ week: r._week, av: r.availability, id: r.id });
    });

    const avIcon  = v => v==="Not Joined"?"✗":v==="On Leave"?"◌":v==="Reopened"?"↺":"→";
    const avColor = v => v==="Not Joined"?"var(--chart-5)":v==="On Leave"?"var(--chart-3)":v==="Reopened"?"var(--orange)":"var(--chart-4)";

    const uniqueCount = grouped.size;
    const totalCount  = needsAttention.length;

    const rows = [...grouped.values()].map(g => {
      const latest     = g.entries[g.entries.length - 1]; // most recent week entry
      const isDup      = g.entries.length > 1;
      const activeWk   = g.entries.find(e => e.week === _currentWeek);
      const rowBg      = activeWk ? "rgba(15,98,254,.04)" : "";

      // Week tags — each is clickable to focus that week's entry
      const weekTags = g.entries.map(e => {
        const wkLabel = e.week.replace("CW","W");
        const isCur   = e.week === _currentWeek;
        return `<span
          title="Click to jump to ${wkLabel} and focus this case"
          onclick="event.stopPropagation();DashWeeklyTracker._focusCase('${e.week}','${e.id}')"
          style="display:inline-flex;align-items:center;font-size:9px;font-weight:600;
            padding:1px 6px;border-radius:var(--radius-md);cursor:pointer;white-space:nowrap;
            background:${isCur?"var(--chart-1)":"rgba(15,98,254,.1)"};
            color:${isCur?"#fff":"var(--chart-1)"};
            border:1px solid ${isCur?"var(--chart-1)":"rgba(15,98,254,.3)"};
            transition:all var(--t-fast)"
          onmouseover="this.style.background='rgba(15,98,254,.25)';this.style.color='var(--chart-1)'"
          onmouseout="this.style.background='${isCur?"var(--chart-1)":"rgba(15,98,254,.1)"}';this.style.color='${isCur?"#fff":"var(--chart-1)"}'"
        >${wkLabel}</span>`;
      }).join("");

      // Duplicate badge
      const dupBadge = isDup
        ? `<span title="${g.entries.length} weeks unresolved" style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(220,38,38,.12);color:var(--red);border:1px solid rgba(220,38,38,.3);white-space:nowrap;flex-shrink:0">
            ×${g.entries.length} weeks
          </span>`
        : "";

      return `<div style="display:flex;align-items:center;gap:10px;padding:7px 12px;border-bottom:1px solid var(--border-subtle);background:${rowBg};flex-wrap:wrap"
        onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='${rowBg}'"
      >
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;min-width:60px">${weekTags}</div>
        <span style="font-size:11px;font-weight:600;color:var(--text-secondary);min-width:90px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${Utils.escHtml((g.owner||"").split(" ").slice(0,2).join(" "))}</span>
        <span
          title="Click to focus — appears in ${g.entries.length} week(s)"
          onclick="event.stopPropagation();DashWeeklyTracker._focusCase('${latest.week}','${latest.id}')"
          style="font-family:var(--font-mono);font-size:10px;color:var(--blue);flex-shrink:0;cursor:pointer;
            text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px;transition:opacity var(--t-fast)"
          onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"
        >${Utils.escHtml(g.caseNumber||"")}</span>
        ${dupBadge}
        <span style="flex:1;font-size:11px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:100px" title="${Utils.escHtml(g.title||"")}">${Utils.escHtml(g.title||"")}</span>
        <span style="font-size:11px;font-weight:600;color:${avColor(latest.av)};white-space:nowrap;flex-shrink:0">${avIcon(latest.av)} ${Utils.escHtml((latest.av||"").replace("Reopened","Reopen"))}</span>
        <span style="font-size:10px;color:var(--text-disabled);font-style:italic;white-space:nowrap;flex-shrink:0">no comment</span>
      </div>`;
    }).join("");

    // Badge shows unique cases + total entries if they differ
    const badgeLabel = uniqueCount < totalCount
      ? `${uniqueCount} <span style="font-weight:400;opacity:.8">(${totalCount} entries)</span>`
      : `${uniqueCount}`;

    el.innerHTML = `<div style="border:1px solid rgba(220,38,38,.2);border-radius:var(--radius-md);overflow:hidden;background:rgba(220,38,38,.02)">
      <div onclick="DashWeeklyTracker._toggleFollowup()" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(220,38,38,.06);border-bottom:${_followupOpen?'1px solid rgba(220,38,38,.15)':'none'};cursor:pointer;user-select:none"
        onmouseover="this.style.background='rgba(220,38,38,.1)'" onmouseout="this.style.background='rgba(220,38,38,.06)'">
        <span style="font-size:12px;font-weight:600;color:var(--red)">🔔 Needs Follow Up</span>
        <span style="font-size:10px;background:var(--red);color:#fff;padding:1px 7px;border-radius:var(--radius-md);font-weight:600;font-family:var(--font-mono)">${badgeLabel}</span>
        <span style="font-size:10px;color:var(--text-tertiary);margin-left:4px;flex:1">
          ${uniqueCount < totalCount ? `${uniqueCount} unique cases across ${totalCount} weeks — ` : ""}Cases needing attention — click to ${_followupOpen?'collapse':'expand'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--chart-5)" stroke-width="2" style="transform:rotate(${_followupOpen?180:0}deg);transition:transform var(--transition-base);flex-shrink:0"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div style="display:${_followupOpen?'block':'none'}">${rows}</div>
    </div>`;
  }

  function _toggleFollowup() {
    _followupOpen = !_followupOpen;
    _renderFollowUp();
  }

  /* ── Focus a single case from the Follow-Up panel ── */
  let _focusedCaseId = null; // null = no focus filter active
  function _focusCase(week, id) {
    // Navigate to the correct week first
    if (_currentWeek !== week) {
      _navClick(week);
    }
    // Set focus filter — _renderTable will use this to show only the focused row
    _focusedCaseId = (_focusedCaseId === id) ? null : id; // toggle off if same case clicked again
    _renderTable(_buildWeeks(_year));
    // Scroll the table row into view and flash it
    setTimeout(() => {
      const row = document.getElementById("wt-row-" + id);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.style.transition = "box-shadow .1s";
        row.style.boxShadow = "inset 0 0 0 2px var(--yellow)";
        setTimeout(() => { row.style.boxShadow = ""; }, 1400);
      }
    }, 80);
  }
  function _clearFocusCase() {
    _focusedCaseId = null;
    _renderTable(_buildWeeks(_year));
  }

  /* ── KPI ── */
  function _renderKPI() {
    const el = document.getElementById("wt-kpi"); if (!el) return;
    const rows = _wr(_year, _currentWeek);
    const sv = n => rows.filter(r=>String(r.severity)===String(n)).length;
    const commented = rows.filter(r=>r.comments&&r.comments.trim()).length;
    const cards = [
      { v: rows.length, l: "Total",    c: "var(--blue)",   bg: "var(--blue-bg)",   bold: true },
      { v: sv(1),       l: "Sev 1",    c: "var(--red)",    bg: "rgba(218,30,40,.06)" },
      { v: sv(2),       l: "Sev 2",    c: "var(--orange)", bg: "rgba(255,131,43,.06)" },
      { v: sv(3),       l: "Sev 3",    c: "var(--chart-3)",       bg: "rgba(166,120,0,.06)" },
      { v: sv(4),       l: "Sev 4",    c: "var(--green)",  bg: "var(--green-bg)" },
      { v: commented,   l: "Notes",    c: "var(--ibm-blue-50)",       bg: "rgba(0,114,195,.06)" },
    ];
    el.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;width:100%">${
      cards.map(({v,l,c,bg,bold}) =>
        `<div style="flex:1;min-width:70px;max-width:130px;padding:8px 12px;border-radius:var(--radius-md);background:${bg};border:1px solid rgba(0,0,0,.06);display:flex;align-items:center;gap:10px">
          <span style="font-size:20px;font-weight:700;color:${c};font-family:var(--font-mono);line-height:1;min-width:24px">${v}</span>
          <span style="font-size:10px;font-weight:600;color:${c};text-transform:none;letter-spacing:var(--tracking-wide);opacity:.8">${l}</span>
        </div>`
      ).join("")
    }</div>`;
  }

  /* ── Filter chips ── */
  function _renderFilterChips(rows) {
    const el = document.getElementById("wt-filter-chips"); if (!el) return;
    // Collect unique owners & categories from this week's rows
    const owners = [...new Set(rows.map(r => r.owner).filter(Boolean))].sort();
    const cats   = [...new Set(rows.map(r => r.category).filter(Boolean))].sort();

    const chip = (label, key, field, val, color) => {
      const active = (field === "owner" ? _filterOwner : _filterCategory) === val;
      return `<button onclick="DashWeeklyTracker._setChip('${field}','${val.replace(/'/g,"\'")}')"
        title="${field === 'owner' ? 'Filter by owner' : 'Filter by category'}: ${label}"
        style="flex-shrink:0;border:none;cursor:pointer;padding:3px 9px;border-radius:var(--radius-md);font-size:10px;font-weight:600;
          letter-spacing:.02em;white-space:nowrap;transition:all var(--t-fast);
          background:${active ? color : "var(--bg-hover)"};
          color:${active ? "#fff" : "var(--text-secondary)"};
          border:1.5px solid ${active ? color : "var(--border-subtle)"};
          box-shadow:${active ? "0 1px 4px rgba(0,0,0,.18)" : "none"}"
        onmouseover="if(!this.classList.contains('active')){this.style.borderColor='${color}';this.style.color='${color}'}"
        onmouseout="if(!this.classList.contains('active')){this.style.borderColor='var(--border-subtle)';this.style.color='var(--text-secondary)'}">
        ${active ? "✕ " : ""}${label}</button>`;
    };

    let html = "";
    if (owners.length > 1) {
      html += `<span style="font-size:9px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-disabled);padding-right:3px;flex-shrink:0">Owner</span>`;
      owners.forEach(o => {
        const initials = o.split(" ").map(p=>p[0]||"").join("").slice(0,2).toUpperCase();
        html += chip(initials, "owner", "owner", o, "var(--chart-1)");
      });
    }
    if (cats.length > 1) {
      html += `<span style="font-size:9px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-disabled);padding-left:6px;padding-right:3px;flex-shrink:0;${owners.length>1?'border-left:1px solid var(--border-subtle);margin-left:2px':''}">${owners.length>1?'Cat':'Category'}</span>`;
      cats.forEach(c => {
        const short = c.length > 12 ? c.slice(0,11)+"…" : c;
        html += chip(short, "cat", "category", c, "var(--chart-4)");
      });
    }
    // Clear all chips button (only shown when a filter is active)
    if (_filterOwner || _filterCategory) {
      html += `<button onclick="DashWeeklyTracker._clearChips()"
        style="flex-shrink:0;border:1px dashed var(--border-subtle);background:none;cursor:pointer;padding:3px 8px;border-radius:var(--radius-md);font-size:10px;color:var(--text-tertiary);transition:all var(--t-fast)"
        onmouseover="this.style.color='var(--red)';this.style.borderColor='var(--red)'" onmouseout="this.style.color='var(--text-tertiary)';this.style.borderColor='var(--border-subtle)'">
        ✕ Clear filters</button>`;
    }
    el.innerHTML = html;
  }

  function _setChip(field, val) {
    if (field === "owner")    { _filterOwner    = _filterOwner    === val ? "" : val; }
    if (field === "category") { _filterCategory = _filterCategory === val ? "" : val; }
    _renderTable(_buildWeeks(_year));
  }

  function _clearChips() {
    _filterOwner = ""; _filterCategory = "";
    _renderTable(_buildWeeks(_year));
  }

  /* ── Table ── */
  function _renderTable(weeks) {
    const wrap = document.getElementById("wt-table-wrap"), cntEl = document.getElementById("wt-row-count");
    if (!wrap) return;
    // Auto-normalize any garbage/numeric category values on render
    let rows = _wr(_year, _currentWeek);
    let changed = false;
    rows = rows.map(r => {
      const raw = r.category || "";
      const norm = _normCat(raw);
      if (norm !== raw) { changed = true; return { ...r, category: norm }; }
      return r;
    });
    if (changed) _swk(_year, _currentWeek, rows);
    // ── Team member filter — only show rows belonging to current team ────────
    const _teamMembers = (() => {
      try {
        const members = (typeof DynamicConfig !== "undefined" && DynamicConfig.teamMembers)
          ? DynamicConfig.teamMembers()
          : (typeof AppData !== "undefined" ? AppData.teamMembers : []);
        return new Set(members.map(m => m.toLowerCase()));
      } catch(e) { return null; }
    })();
    const _isTeamRow = r => {
      if (!_teamMembers || !_teamMembers.size) return true; // no list = show all
      const owner = (r.owner || "").toLowerCase();
      return _teamMembers.has(owner);
    };

    const q = (document.getElementById("wt-search")?.value||"").toLowerCase();
    // Apply team filter + text search + chip filters + focus filter
    const filt = rows.filter(r => {
      if (_focusedCaseId) return r.id === _focusedCaseId; // focus-mode: only the pinned case
      if (!_isTeamRow(r)) return false; // hide non-team-member rows
      if (q && ![r.owner,r.caseNumber,r.title,r.category,r.comments].some(v=>v&&String(v).toLowerCase().includes(q))) return false;
      if (_filterOwner    && r.owner    !== _filterOwner)    return false;
      if (_filterCategory && r.category !== _filterCategory) return false;
      return true;
    });
    if (cntEl) cntEl.textContent = filt.length+" case"+(filt.length!==1?"s":"");

    // Focus-mode banner — shown when a single case is pinned from the Follow-Up panel
    const focusBanner = document.getElementById("wt-focus-banner");
    if (_focusedCaseId) {
      const fc = rows.find(r => r.id === _focusedCaseId);
      const bannerHtml = `<div id="wt-focus-banner" style="display:flex;align-items:center;gap:8px;padding:6px 12px;
        background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.35);border-radius:var(--radius-md);margin-bottom:8px;flex-wrap:wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span style="font-size:11px;font-weight:600;color:var(--yellow-text)">Showing case: ${Utils.escHtml(fc?.caseNumber||"")} — ${Utils.escHtml((fc?.title||"").slice(0,60))}${(fc?.title||"").length>60?"…":""}</span>
        <button onclick="DashWeeklyTracker._clearFocusCase()" style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;padding:3px 9px;border-radius:var(--radius-sm);border:1px solid rgba(245,158,11,.4);background:none;color:var(--yellow-text);cursor:pointer;transition:all var(--t-fast)"
          onmouseover="this.style.background='rgba(245,158,11,.12)'" onmouseout="this.style.background='none'">
          ✕ Show all cases
        </button>
      </div>`;
      if (focusBanner) {
        focusBanner.outerHTML = bannerHtml;
      } else {
        const bulkBar = document.getElementById("wt-bulk-bar");
        if (bulkBar) bulkBar.insertAdjacentHTML("afterend", bannerHtml);
      }
    } else {
      if (focusBanner) focusBanner.remove();
    }

    // Build filter chip suggestions from current week's unique owners + categories
    _renderFilterChips(rows);

    // Apply sort — date-aware for closedDate, lexical for everything else
    const sortedFilt = _sortCol ? [...filt].sort((a,b) => {
      if (_sortCol === "closedDate") {
        const _parseDate = (v) => {
          if (!v) return 0;
          const s = String(v).trim();
          if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime() || 0;
          const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (mdy) return new Date(`${mdy[3]}-${mdy[1].padStart(2,"0")}-${mdy[2].padStart(2,"0")}`).getTime() || 0;
          return 0;
        };
        const da = _parseDate(a.closedDate), db = _parseDate(b.closedDate);
        return (da - db) * _sortDir;
      }
      const va = String(a[_sortCol]||"").toLowerCase();
      const vb = String(b[_sortCol]||"").toLowerCase();
      return va < vb ? -_sortDir : va > vb ? _sortDir : 0;
    }) : filt;

    if (!rows.length) {
      wrap.innerHTML = `<div style="text-align:center;padding:56px 24px;color:var(--text-tertiary)"><div class="fs-32-mb10">📭</div><div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">No cases this week</div><div class="fs-12">Upload your IBM cases CSV on the landing page — closed team cases are auto-populated here by week.</div></div>`;
      return;
    }
    if (!filt.length) {
      wrap.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-tertiary)"><div class="kpi-icon">🔍</div><div style="font-size:13px;font-weight:600;color:var(--text-secondary)">No results</div></div>`;
      return;
    }

    // Consistent rounded pill badge for severity (#10)
    const sevBadge = s => {
      const m={"1":["var(--red-bg)","var(--red)","rgba(218,30,40,.25)","S1"],"2":["var(--orange-bg)","var(--orange)","rgba(255,131,43,.25)","S2"],"3":["var(--yellow-bg)","var(--chart-3)","rgba(166,120,0,.2)","S3"],"4":["var(--green-bg)","var(--green)","rgba(25,128,56,.2)","S4"]};
      const entry=m[String(s)];
      if(!entry) return `<span class="text-dim">\u2014</span>`;
      const [bg,col,b,label]=entry;
      return `<span title="Severity ${s}" style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:${bg};color:${col};border:1px solid ${b};font-family:var(--font-mono);display:inline-block;min-width:28px;text-align:center">${label}</span>`;
    };
    const fmtDate = s => {
      if (!s) return "\u2014";
      try { const d=new Date(s); if(isNaN(d)) return s; return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); } catch(e){return s;}
    };

    // Category colour map for badges (matches Knowledge Hub canonical names)
    const CAT_COLORS = {
      "Issue Fixed in iFix":           ["var(--green-bg)","var(--green)","rgba(26,122,26,.2)"],
      "LQE Validation / Reindexing":   ["var(--ibm-blue-10)","var(--ibm-blue-60)","rgba(0,88,214,.2)"],
      "Export / Import Issues":        ["var(--yellow-bg)","var(--yellow-text)","rgba(153,119,0,.2)"],
      "Known Defect":                  ["var(--red-bg)","var(--red)","rgba(192,0,42,.2)"],
      "Out of Memory / Heap Issues":   ["var(--red-bg)","#c00","rgba(192,0,0,.2)"],
      "TRS Feed Validation":           ["var(--ibm-blue-10)","var(--ibm-blue-50)","rgba(0,122,184,.2)"],
      "Insufficient Information in Logs": ["var(--bg-layer)","#555","rgba(80,80,80,.18)"],
      "Single Occurrence Issue":       ["var(--purple-bg)","var(--purple)","rgba(90,46,204,.2)"],
      "DCM Connectivity Issues":       ["var(--orange-bg)","var(--orange)","rgba(184,104,0,.2)"],
      "Database Connectivity Issues":  ["var(--orange-bg)","#d84","rgba(216,132,0,.2)"],
      "Backup & Restore":             ["var(--red-bg)","var(--red)","rgba(192,48,96,.2)"],
    };

    // Category cell — compact pill that reveals a floating picker on click (#3)
    const catCell = r => {
      const norm = _normCat(r.category);
      const col = CAT_COLORS[norm];
      if (norm && col) {
        return `<div style="min-width:110px;max-width:155px">
          <span class="wt-cat-pill" data-id="${r.id}" onclick="DashWeeklyTracker._openCatPicker('${r.id}',this)"
            title="Click to change category"
            style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;
              padding:3px 8px;border-radius:var(--radius-md);cursor:pointer;white-space:nowrap;max-width:150px;
              overflow:hidden;text-overflow:ellipsis;
              background:${col[0]};color:${col[1]};border:1px solid ${col[2]};
              transition:box-shadow .12s,opacity .12s"
            onmouseover="this.style.boxShadow='0 0 0 2px ${col[2]}';this.style.opacity='.85'"
            onmouseout="this.style.boxShadow='none';this.style.opacity='1'">
            ${Utils.escHtml(norm)}
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </div>`;
      } else {
        return `<div style="min-width:110px;max-width:155px">
          <span class="wt-cat-pill wt-cat-empty" data-id="${r.id}" onclick="DashWeeklyTracker._openCatPicker('${r.id}',this)"
            title="Click to set category"
            style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:500;
              padding:3px 8px;border-radius:var(--radius-md);cursor:pointer;white-space:nowrap;
              background:rgba(255,131,43,.07);color:var(--orange);
              border:1.5px dashed rgba(255,131,43,.5);transition:all var(--t-fast)"
            onmouseover="this.style.background='rgba(255,131,43,.15)'"
            onmouseout="this.style.background='rgba(255,131,43,.07)'">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Set category
          </span>
        </div>`;
      }
    };

    // Availability dropdown — coloured select with per-option styling (#6)
    const avChip = r => {
      const av = r.availability || "";
      const avColor = v => v==="Attended"?"var(--chart-2)":v==="Not Joined"?"var(--chart-5)":v==="On Leave"?"var(--chart-3)":v==="Follow Up"?"var(--chart-4)":v==="Reopened"?"var(--orange)":"var(--text-tertiary)";
      const avBg   = v => v==="Attended"?"rgba(25,128,56,.08)":v==="Not Joined"?"rgba(218,30,40,.07)":v==="On Leave"?"rgba(166,120,0,.08)":v==="Follow Up"?"rgba(124,58,237,.08)":v==="Reopened"?"rgba(224,112,0,.09)":"";
      return `<select class="form-input form-input-sm"
        style="font-size:10px;padding:3px 4px;width:100%;font-weight:${av?"600":"400"};
          color:${avColor(av)};background:${avBg(av)};border-color:${av?"currentColor":"var(--border-subtle)"};
          border-radius:var(--radius-sm);transition:all var(--t-fast)"
        onchange="DashWeeklyTracker._setAvailability('${r.id}',this.value);const c=this.value;const col=c==='Attended'?'var(--chart-2)':c==='Not Joined'?'var(--chart-5)':c==='On Leave'?'var(--chart-3)':c==='Follow Up'?'var(--chart-4)':c==='Reopened'?'var(--orange)':'var(--text-tertiary)';const bg=c==='Attended'?'rgba(25,128,56,.08)':c==='Not Joined'?'rgba(218,30,40,.07)':c==='On Leave'?'rgba(166,120,0,.08)':c==='Follow Up'?'rgba(124,58,237,.08)':c==='Reopened'?'rgba(224,112,0,.09)':'';this.style.color=col;this.style.background=bg;this.style.borderColor=c?'currentColor':'var(--border-subtle)';this.style.fontWeight=c?'600':'400'">
        <option value="" ${!av?"selected":""}>— select —</option>
        <option value="Attended"  ${av==="Attended"  ?"selected":""}>✓ Attended</option>
        <option value="Not Joined"${av==="Not Joined"?"selected":""}>✗ Not Joined</option>
        <option value="On Leave"  ${av==="On Leave"  ?"selected":""}>◌ On Leave</option>
        <option value="Follow Up" ${av==="Follow Up" ?"selected":""}>→ Follow Up</option>
        <option value="Reopened"  ${av==="Reopened"  ?"selected":""}>↺ Reopen</option>
      </select>`;
    };

    const trs = sortedFilt.map((r,i) => {
      // Comment cell — PRIMARY focus column: warm background, pulse when empty
      const CMT_PREVIEW_LEN = 80;
      const cmtFull = r.comments || "";
      const cmtTrunc = cmtFull.length > CMT_PREVIEW_LEN;
      const cmtPreview = cmtTrunc ? cmtFull.slice(0, CMT_PREVIEW_LEN) : cmtFull;
      const cmtInner = cmtFull
        ? `<div style="display:flex;flex-direction:column;gap:4px">
            <span style="font-size:11px;line-height:1.5;color:var(--text-primary);font-weight:500">${_linkify(cmtPreview)}${cmtTrunc
              ? `<span style="color:var(--ibm-blue-50);font-size:10px;font-weight:600;margin-left:3px">…more</span>`
              : ""}</span>
            <span style="font-size:9px;color:var(--text-tertiary);font-family:var(--font-mono)">${cmtFull.length} chars</span>
          </div>`
        : `<span class="wt-cmt-empty" style="display:inline-flex;align-items:center;gap:6px;
              padding:4px 8px;border-radius:var(--radius-sm);
              background:rgba(245,158,11,.1);border:1.5px dashed rgba(245,158,11,.5);
              color:var(--yellow-text);font-size:10px;font-weight:600;white-space:nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Add note
          </span>`;
      const cmtCell = `<div id="wt-cmttrig-${r.id}"
             onclick="DashWeeklyTracker._openCmtPopover('${r.id}',this)"
             style="min-width:160px;max-width:240px;cursor:pointer;padding:5px 7px;border-radius:var(--radius-sm);
               background:${r.comments?"rgba(15,98,254,.04)":"rgba(245,158,11,.04)"};
               border:1px solid ${r.comments?"rgba(15,98,254,.15)":"rgba(245,158,11,.25)"};
               transition:all var(--transition-fast)"
             onmouseover="this.style.background='${r.comments?"rgba(15,98,254,.1)":"rgba(245,158,11,.12)"}';this.style.borderColor='${r.comments?"rgba(15,98,254,.4)":"rgba(245,158,11,.6)"}';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px ${r.comments?"rgba(15,98,254,.12)":"rgba(245,158,11,.2)"}'"
             onmouseout="this.style.background='${r.comments?"rgba(15,98,254,.04)":"rgba(245,158,11,.04)"}';this.style.borderColor='${r.comments?"rgba(15,98,254,.15)":"rgba(245,158,11,.25)"}';this.style.transform='';this.style.boxShadow=''"
           >${cmtInner}</div>`;

      // History indicator
      const hist = _loadHistory()[r.caseNumber];
      const histBadge = hist ? `<span title="${hist.entries.length} history entries" style="cursor:pointer;font-size:9px;background:rgba(255,131,43,.15);color:var(--orange);border:1px solid rgba(255,131,43,.3);padding:1px 5px;border-radius:var(--radius-xs);margin-left:4px" onclick="DashWeeklyTracker._switchTab('history')">⏱ ${hist.entries.length}</span>` : "";

      // Performance case highlighting
      const _wtPerfNums    = new Set(typeof Data !== "undefined" ? Data.getPerfCaseNums() : []);
      const _wtNonPerfNums = new Set(typeof Data !== "undefined" ? Data.getNonPerfCaseNums() : []);
      // isPerf: must be in perfNums AND not explicitly in nonPerfNums.
      // Meta category is NOT used as a standalone fallback — removePerfCaseNum clears meta,
      // so if a case was removed from perf tagging it will not show the badge.
      const _isPerf = r.caseNumber &&
        _wtPerfNums.has(r.caseNumber) &&
        !_wtNonPerfNums.has(r.caseNumber);
      const perfRowStyle = _isPerf ? "background:rgba(218,30,40,.06);border-left:3px solid rgba(218,30,40,.6);" : "";
      const perfBadgeWT  = _isPerf
        ? `<span title="Performance Case" style="font-size:9px;background:rgba(218,30,40,.15);color:var(--red);border:1px solid rgba(218,30,40,.3);padding:1px 5px;border-radius:var(--radius-xs);margin-left:4px;font-weight:600">\u26a1 Perf</span>`
        : "";

      const isSelected = _selectedRows.has(r.id);
      return `<tr id="wt-row-${r.id}" style="${perfRowStyle}${isSelected?'outline:2px solid rgba(15,98,254,.35);outline-offset:-2px;background:rgba(15,98,254,.04);':''}">
        <td style="text-align:center;width:28px"><input type="checkbox" ${isSelected?"checked":""} onchange="DashWeeklyTracker._selRow('${r.id}',this.checked)" class="cursor-p" width="14" height="14" onclick="event.stopPropagation()"></td>
        <td style="color:var(--text-tertiary);font-family:var(--font-mono);font-size:11px;width:28px">${i+1}</td>
        <td class="nowrap"><span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-hover);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:2px 7px;font-size:11px;font-weight:500;white-space:nowrap;max-width:130px;overflow:hidden;text-overflow:ellipsis">${Utils.escHtml((r.owner||"\u2014").split(" ").slice(0,2).join(" "))}</span></td>
        <td class="nowrap">
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--blue)">${Utils.escHtml(r.caseNumber||"\u2014")}${histBadge}</div>
          ${_isPerf ? `<div style="margin-top:2px">${perfBadgeWT}</div>` : ""}
        </td>
        <td style="max-width:200px"><div style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12px" title="${Utils.escHtml(r.title||"")}">${Utils.escHtml(r.title||"\u2014")}</div></td>
        <td class="text-center">${sevBadge(r.severity)}</td>
        <td><span style="font-size:10px;font-weight:500;color:var(--green);white-space:normal;line-height:1.3">✓ ${Utils.escHtml(r.status||"Closed")}</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;white-space:nowrap">${fmtDate(r.closedDate)}</td>
        <td style="background:${r.comments?"rgba(15,98,254,.03)":"rgba(245,158,11,.05)"};border-left:2px solid ${r.comments?"rgba(15,98,254,.2)":"rgba(245,158,11,.4)"};border-right:2px solid ${r.comments?"rgba(15,98,254,.2)":"rgba(245,158,11,.4)"}">${cmtCell}</td>
        <td>${catCell(r)}</td>
        <td>${avChip(r)}</td>
        <td>
          <div class="wt-ra" style="display:flex;gap:4px;opacity:0;transition:opacity var(--t-fast)">
            <button class="btn btn-ghost btn-2xs" onclick="DashWeeklyTracker._editRow('${r.id}')">Edit</button>
            <button class="btn btn-danger btn-2xs" onclick="DashWeeklyTracker._delRow('${r.id}')">&times;</button>
          </div>
        </td>
      </tr>`;
    }).join("");

    const thStyle = (col) => {
      const active = _sortCol === col;
      const arrow = active ? (_sortDir===1 ? " ▲" : " ▼") : " ⇅";
      return `<th style="cursor:pointer;user-select:none;white-space:nowrap;color:${active?"var(--blue)":"inherit"}"
        onclick="DashWeeklyTracker._sortBy('${col}')"
        onmouseover="this.style.color='var(--blue)'" onmouseout="this.style.color='${active?"var(--blue)":"inherit"}'"
        title="Sort by ${col}">${col==="owner"?"Case Owner":col==="caseNumber"?"Case Number":col==="title"?"Title":col==="severity"?"Sev":col==="status"?"Status":col==="closedDate"?"Closed Date":col==="comments"?"Comments":col==="category"?"Category":col==="availability"?"Availability":col}<span class="fs-9-muted">${arrow}</span></th>`;
    };

    wrap.innerHTML = `
      <table class="data-table" style="font-size:11px;table-layout:fixed;width:100%;min-width:1100px">
        <colgroup>
          <col style="width:28px"><col style="width:28px"><col style="width:110px"><col style="width:115px"><col style="width:190px">
          <col style="width:44px"><col style="width:95px">
          <col class="w-100"><col style="width:165px"><col style="width:155px"><col style="width:125px"><col style="width:72px">
        </colgroup>
        <thead><tr>
          <th style="width:28px;text-align:center"><input type="checkbox" id="wt-sel-all" title="Select all" onchange="DashWeeklyTracker._selAll(this.checked)" class="cursor-p" width="14" height="14"></th>
          <th style="width:32px">#</th>
          ${thStyle("owner")}
          ${thStyle("caseNumber")}
          ${thStyle("title")}
          <th style="text-align:center;width:44px;cursor:pointer;user-select:none" onclick="DashWeeklyTracker._sortBy('severity')" title="Sort by Severity">Sev<span class="fs-9-muted">${_sortCol==="severity"?(_sortDir===1?" ▲":" ▼"):" ⇅"}</span></th>
          ${thStyle("status")}
          ${thStyle("closedDate")}
          <th style="cursor:pointer;user-select:none;white-space:nowrap;background:rgba(245,158,11,.08);border-left:2px solid rgba(245,158,11,.35);border-right:2px solid rgba(245,158,11,.35);color:var(--yellow-text);font-weight:700;letter-spacing:.02em"
            onclick="DashWeeklyTracker._sortBy('comments')"
            onmouseover="this.style.background='rgba(245,158,11,.16)'" onmouseout="this.style.background='rgba(245,158,11,.08)'"
            title="Sort by Comments — this is the most important column">
            <span style="display:inline-flex;align-items:center;gap:4px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Comments
              <span style="font-size:8px;background:rgba(245,158,11,.3);color:var(--yellow-text);padding:1px 5px;border-radius:var(--radius-md);font-weight:700">KEY</span>
            </span>
            <span class="fs-9-muted">${_sortCol==="comments"?(_sortDir===1?" ▲":" ▼"):" ⇅"}</span>
          </th>
          ${thStyle("category")}
          ${thStyle("availability")}
          <th></th>
        </tr></thead>
        <tbody>${trs}</tbody>
      </table>
      <style>
        .data-table tbody tr:hover .wt-ra{opacity:1!important}
        .data-table td{overflow:hidden;text-overflow:ellipsis}
        #wt-table-wrap{overflow-x:auto}
        .data-table thead th{transition:color var(--t-fast)}
        @keyframes wt-cmt-pulse {
          0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0);border-color:rgba(245,158,11,.35)}
          50%{box-shadow:0 0 0 3px rgba(245,158,11,.2);border-color:rgba(245,158,11,.7)}
        }
        .wt-cmt-empty{animation:wt-cmt-pulse 2.4s ease-in-out infinite}
        .data-table tbody tr:hover .wt-cmt-empty{animation:none}
      </style>`;

    // (comment popover handled separately via _openCmtPopover)
  }

  /* ── History panel (#13 hide-empty toggle) ── */
  function _renderHistory() { _renderHistoryFiltered(); }

  /* ── Cases Reopened panel ─────────────────────────────────────────── */
  async function _renderReopened() {
    const panel = document.getElementById("wt-reopened-panel");
    if (!panel) return;

    let records = [];
    try { records = await IIPStore.getReopened(); } catch(e) {}

    if (!records.length) {
      panel.innerHTML = `
        <div style="padding:40px 24px;text-align:center;color:var(--text-tertiary)">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.35;margin-bottom:12px"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-5.6L1 10"/></svg>
          <div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">No reopened cases yet</div>
          <div style="font-size:12px;line-height:1.6;max-width:360px;margin:0 auto">
            When a case in the Weekly Tracker reappears with an active status in a new CSV upload, it will be automatically tracked here.
          </div>
        </div>`;
      return;
    }

    const escH = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const sevColor = s => s==="1"?"var(--red)":s==="2"?"var(--orange)":s==="3"?"var(--chart-2)":"var(--text-tertiary)";

    const rows = records.map(r => `
      <tr style="border-bottom:1px solid var(--border-subtle)">
        <td style="padding:10px 12px;font-weight:600;color:var(--text-secondary);font-size:12px;white-space:nowrap">${escH(r.owner)}</td>
        <td style="padding:10px 12px">
          <span class="case-number-copy" data-cn="${escH(r.caseNumber)}"
            style="cursor:pointer;color:var(--ibm-blue-50);font-weight:600;font-family:var(--font-mono);font-size:12px"
            title="Click to copy">${escH(r.caseNumber)}</span>
        </td>
        <td style="padding:10px 12px;font-size:12px;color:var(--text-primary);max-width:320px">
          <span title="${escH(r.title)}" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:300px">${escH(r.title)}</span>
        </td>
        <td style="padding:10px 12px;text-align:center">
          <span style="font-size:11px;font-weight:700;color:${sevColor(r.severity)}">S${escH(r.severity)}</span>
        </td>
        <td style="padding:10px 12px">
          <span style="font-size:11px;padding:3px 8px;border-radius:20px;background:rgba(15,98,254,0.1);color:var(--ibm-blue-50);font-weight:600;white-space:nowrap">${escH(r.activeStatus)}</span>
        </td>
        <td style="padding:10px 12px;font-size:11px;color:var(--text-tertiary);white-space:nowrap">${escH(r.detectedUpload||"")}</td>
        <td style="padding:10px 12px;font-size:11px;color:var(--text-tertiary);max-width:160px">
          <span title="${escH(r.product)}" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px">${escH(r.product)}</span>
        </td>
        <td style="padding:10px 12px;text-align:center">
          <button onclick="DashWeeklyTracker._dismissReopen('${escH(r.caseNumber)}')"
            title="Dismiss from this list"
            style="background:none;border:1px solid var(--border-subtle);border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer;color:var(--text-tertiary);font-family:inherit">
            Dismiss
          </button>
        </td>
      </tr>`).join("");

    panel.innerHTML = `
      <div style="padding:16px 16px 0">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-5.6L1 10"/></svg>
          <span style="font-size:13px;font-weight:700;color:var(--text-primary)">${records.length} Reopened Case${records.length!==1?"s":""}</span>
          <span style="font-size:11px;color:var(--text-tertiary);margin-left:4px">— cases that were closed but reappeared as active in a later CSV upload</span>
        </div>
        <div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border-subtle)">
          <table style="width:100%;border-collapse:collapse;font-family:var(--font-sans)">
            <thead>
              <tr style="background:var(--bg-layer);border-bottom:2px solid var(--border-subtle)">
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-tertiary);white-space:nowrap">OWNER</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-tertiary);white-space:nowrap">CASE #</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-tertiary)">TITLE</th>
                <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:600;color:var(--text-tertiary)">SEV</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-tertiary);white-space:nowrap">CURRENT STATUS</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-tertiary);white-space:nowrap">DETECTED</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-tertiary)">PRODUCT</th>
                <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:600;color:var(--text-tertiary)"></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p style="font-size:11px;color:var(--text-tertiary);margin:10px 0 0;padding-bottom:16px">
          Records are kept permanently. Use Dismiss to remove individual entries from this view.
        </p>
      </div>`;
  }

  async function _dismissReopen(caseNumber) {
    try {
      const existing = await IIPStore.getReopened();
      const updated = existing.filter(r => r.caseNumber !== caseNumber);
      await IIPStore.setReopened(updated);
      _renderReopened();
    } catch(e) {}
  }
  function _renderHistoryFiltered() {
    const el = document.getElementById("wt-history-content"); if (!el) return;
    const h = _loadHistory();
    const q = (document.getElementById("wt-hist-search")?.value||"").toLowerCase();
    const hideEmpty = document.getElementById("wt-hist-hide-empty")?.checked || false;
    const entries = Object.values(h).filter(item => {
      if (!(!q || item.caseNumber.toLowerCase().includes(q) || (item.owner||"").toLowerCase().includes(q))) return false;
      if (hideEmpty) {
        // Keep only cases where at least one entry has a real comment or meaningful status change
        const hasContent = item.entries.some(e =>
          (e.commentAfter && e.commentAfter.trim()) ||
          (e.statusBefore !== e.statusAfter) ||
          e.isReopen || e.availability
        );
        if (!hasContent) return false;
      }
      return true;
    });
    // Sort: cases with most recent activity first
    entries.sort((a, b) => {
      const ta = a.entries[0]?.ts || ""; const tb = b.entries[0]?.ts || "";
      return tb.localeCompare(ta);
    });
    if (!entries.length) {
      el.innerHTML = `<div style="text-align:center;padding:56px;color:var(--text-tertiary)">
        <div class="fs-32-mb10">⏱</div>
        <div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">No history yet</div>
        <div class="fs-12">History is recorded automatically when you save comments or edit cases.<br>Reopen cases and alert-category changes are tracked here permanently.</div>
      </div>`;
      return;
    }
    el.innerHTML = entries.map(item => {
      // Count reopened appearances
      const reopenCount = item.entries.filter(e => e.isReopen || e.availability === "Reopened").length;
      const reopenBadge = reopenCount > 0
        ? `<span style="font-size:10px;background:rgba(224,112,0,.15);color:var(--orange);border:1px solid rgba(224,112,0,.3);padding:1px 7px;border-radius:var(--radius-md);font-weight:600">↺ Reopen ×${reopenCount}</span>`
        : "";
      const rows = item.entries.map(e => {
        const dt = (() => { try { const d = new Date(e.ts); return isNaN(d) ? (e.ts || "—") : d.toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); } catch(err) { return e.ts || "—"; } })();
        const isReopenEntry = e.isReopen || e.availability === "Reopened";
        const isAlertEntry  = e.availability && e.availability !== "Attended" && !isReopenEntry;
        // Border color: orange for reopen, purple for alert, default for comment/status changes
        const borderColor = isReopenEntry ? "var(--orange)" : isAlertEntry ? "var(--chart-4)" : "var(--border-subtle)";
        const bgColor     = isReopenEntry ? "rgba(224,112,0,.06)" : isAlertEntry ? "rgba(124,58,237,.05)" : "var(--bg-hover)";

        // Entry type badge
        let typeBadge = "";
        if (isReopenEntry) {
          const prevWk = e.prevWeek ? ` (from ${e.prevWeek})` : "";
          typeBadge = `<span style="font-size:10px;font-weight:600;background:rgba(224,112,0,.15);color:var(--orange);border:1px solid rgba(224,112,0,.3);padding:1px 7px;border-radius:var(--radius-xs);margin-right:6px">↺ Reopen${prevWk}</span>`;
        } else if (e.availability === "Not Joined") {
          typeBadge = `<span style="font-size:10px;font-weight:600;background:rgba(218,30,40,.1);color:var(--red);border:1px solid rgba(218,30,40,.25);padding:1px 7px;border-radius:var(--radius-xs);margin-right:6px">✗ Not Joined</span>`;
        } else if (e.availability === "On Leave") {
          typeBadge = `<span style="font-size:10px;font-weight:600;background:rgba(166,120,0,.1);color:var(--yellow);border:1px solid rgba(166,120,0,.25);padding:1px 7px;border-radius:var(--radius-xs);margin-right:6px">◌ On Leave</span>`;
        } else if (e.availability === "Follow Up") {
          typeBadge = `<span style="font-size:10px;font-weight:600;background:rgba(124,58,237,.1);color:var(--purple);border:1px solid rgba(124,58,237,.25);padding:1px 7px;border-radius:var(--radius-xs);margin-right:6px">→ Follow Up</span>`;
        }

        const statusChange = e.statusBefore !== e.statusAfter
          ? `<div style="font-size:11px;margin-bottom:4px"><span class="text-muted">Status:</span> <span style="color:var(--red);text-decoration:line-through">${Utils.escHtml(e.statusBefore||"—")}</span> → <span class="text-green-c">${Utils.escHtml(e.statusAfter||"—")}</span></div>`
          : "";
        const cmtChange = e.commentAfter
          ? `<div class="fs-11"><span class="text-muted">Comment:</span> <span class="c-primary">${Utils.escHtml(e.commentAfter)}</span></div>`
          : "";
        const noContent = !statusChange && !cmtChange && !typeBadge;
        const eIdx = item.entries.indexOf(e);
        return `<div style="padding:8px 12px;border-left:2px solid ${borderColor};margin-bottom:6px;background:${bgColor};border-radius:0 6px 6px 0;position:relative">
          <div style="font-size:10px;color:var(--text-tertiary);font-family:var(--font-mono);margin-bottom:4px;display:flex;align-items:center;flex-wrap:wrap;gap:4px">
            ${dt} · ${Utils.escHtml(e.week||"")} ${e.year||""} ${typeBadge}
            <button class="wt-hist-del-entry" data-cn="${Utils.escHtml(item.caseNumber)}" data-idx="${eIdx}"
              title="Delete this entry" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-disabled);font-size:12px;padding:0 2px;line-height:1;border-radius:var(--radius-xs);flex-shrink:0"
              onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--text-disabled)'">✕</button>
          </div>
          ${statusChange}${cmtChange}
          ${noContent ? '<div style="font-size:11px;color:var(--text-disabled);font-style:italic">Case edited</div>' : ""}
        </div>`;
      }).join("");
      return `<div class="tile" style="margin-bottom:12px;padding:14px 16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
          <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--blue)">${Utils.escHtml(item.caseNumber)}</span>
          <span style="background:var(--bg-hover);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:2px 8px;font-size:11px">${Utils.escHtml(item.owner||"")}</span>
          ${reopenBadge}
          <span class="text-10 text-muted">${item.entries.length} change${item.entries.length!==1?"s":""}</span>
          <button class="wt-hist-del-case" data-cn="${Utils.escHtml(item.caseNumber)}"
            title="Delete all history for this case"
            style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;background:rgba(218,30,40,.07);border:1px solid rgba(218,30,40,.2);color:var(--red);border-radius:var(--radius-sm);padding:2px 9px;font-size:10px;font-weight:600;cursor:pointer;flex-shrink:0"
            onmouseover="this.style.background='rgba(218,30,40,.15)'" onmouseout="this.style.background='rgba(218,30,40,.07)'">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete case history
          </button>
        </div>
        ${rows}
      </div>`;
    }).join("");
  }

  /* ── History Delete helpers ── */
  function _deleteEntireHistory() {
    _saveHistory({});
    _renderHistory();
    _toast("All history cleared");
  }

  function _deleteCaseHistory(cn) {
    const h = _loadHistory();
    delete h[cn];
    _saveHistory(h);
    _renderHistory();
    _renderTable(_buildWeeks(_year)); // refresh history badges on tracker rows
    _toast(`History for ${cn} deleted`);
  }

  function _deleteHistoryEntry(cn, idx) {
    const h = _loadHistory();
    if (!h[cn]) return;
    h[cn].entries.splice(idx, 1);
    if (!h[cn].entries.length) {
      delete h[cn];
    }
    _saveHistory(h);
    _renderHistory();
    _renderTable(_buildWeeks(_year));
    _toast(`Entry deleted`);
  }

  /* ── History Export / Import ── */
  function _exportHistory() {
    const h = _loadHistory();
    if (!Object.keys(h).length) { _toast("No history to export", true); return; }
    const blob = new Blob([JSON.stringify(h, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wtracker_history_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    _toast("History exported — " + Object.keys(h).length + " cases");
  }

  function _importHistory() {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json";
    inp.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const text = ev.target.result.replace(/```json|```/g, "").trim();
          const imported = JSON.parse(text);
          if (typeof imported !== "object" || Array.isArray(imported)) throw new Error("Invalid format");
          const existing = _loadHistory();
          // Merge: imported entries prepended to existing entries per case
          let count = 0;
          Object.entries(imported).forEach(([cn, item]) => {
            count++;
            if (!existing[cn]) {
              existing[cn] = item;
            } else {
              const merged = [...(item.entries || []), ...existing[cn].entries];
              // Deduplicate by timestamp + week
              const seen = new Set();
              existing[cn].entries = merged.filter(entry => {
                const key = (entry.ts || "") + "|" + (entry.week || "") + "|" + (entry._seedId || "");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              }).slice(0, 50);
              existing[cn].owner = item.owner || existing[cn].owner;
            }
          });
          _saveHistory(existing);
          _renderHistory();
          _renderTable(_buildWeeks(_year)); // refresh history badges
          _toast("History imported — " + count + " cases merged");
        } catch(err) {
          _toast("Import failed: " + err.message, true);
        }
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  /* ── Event binding ── */
  function _bindEvents(weeks) {
    document.getElementById("wt-search")?.addEventListener("input", () => _renderTable(weeks));
    document.getElementById("wt-export-year-btn")?.addEventListener("click", _exportYearCSV);
    document.getElementById("wt-mcancel")?.addEventListener("click", _closeModal);
    document.getElementById("wt-msave")?.addEventListener("click", () => _saveModal(weeks));
    document.getElementById("wt-modal")?.addEventListener("click", e => { if(e.target===document.getElementById("wt-modal")) _closeModal(); });
    // History toolbar: Export / Import / Reset
    document.getElementById("wt-hist-export-btn")?.addEventListener("click", _exportHistory);
    document.getElementById("wt-hist-export-csv-btn")?.addEventListener("click", _exportHistoryCSV);
    document.getElementById("wt-hist-search")?.addEventListener("input", _renderHistoryFiltered);
    document.getElementById("wt-hist-import-btn")?.addEventListener("click", _importHistory);
    document.getElementById("wt-hist-reset-btn")?.addEventListener("click", () => {
      if (!confirm("⚠️ This will permanently delete ALL case history entries.\n\nThis action cannot be undone. Continue?")) return;
      try { localStorage.removeItem(HISTORY_KEY); } catch(e) {}
      _renderHistory();
      _renderTable(weeks);
      _toast("All history cleared");
    });

    // Admin: clear all history (danger zone button — same action)
    document.getElementById("wt-clear-history-btn")?.addEventListener("click", () => {
      if (!confirm("⚠️ This will permanently delete ALL case history entries for all users and weeks.\n\nThis action cannot be undone. Continue?")) return;
      _deleteEntireHistory();
      _renderTable(weeks);
    });

    // ── Event delegation for per-case and per-entry delete buttons ────
    // Attach to wt-history-panel (stable parent) not wt-history-content
    // (which gets its innerHTML replaced on every _renderHistory call)
    const histContent = document.getElementById("wt-history-panel");
    if (histContent && !histContent._delWired) {
      histContent._delWired = true;
      histContent.addEventListener("click", e => {
        // Delete entire case history
        const delCaseBtn = e.target.closest(".wt-hist-del-case");
        if (delCaseBtn) {
          const cn = delCaseBtn.dataset.cn;
          if (!cn) return;
          if (!confirm(`Delete ALL history entries for ${cn}?\n\nThis cannot be undone.`)) return;
          _deleteCaseHistory(cn);
          return;
        }
        // Delete single entry
        const delEntryBtn = e.target.closest(".wt-hist-del-entry");
        if (delEntryBtn) {
          const cn  = delEntryBtn.dataset.cn;
          const idx = parseInt(delEntryBtn.dataset.idx, 10);
          if (!cn || isNaN(idx)) return;
          if (!confirm(`Delete this history entry for ${cn}?`)) return;
          _deleteHistoryEntry(cn, idx);
        }
      });
    }
    // Auto-suggest category in modal when title changes — hint only, never auto-applies
    document.getElementById("wm-title")?.addEventListener("input", function() {
      const catSel = document.getElementById("wm-cat");
      // Only show suggestion if no category is already selected
      if (catSel && catSel.value) return;
      const sug = wtSuggestCategory(this.value, document.getElementById("wm-cmt")?.value||"");
      const hint = document.getElementById("wm-cat-suggest");
      if (hint) {
        if (sug) {
          hint.textContent = "💡 Click to apply: "+sug;
          hint.onclick = () => { if(catSel){ catSel.value=sug; hint.textContent=""; } };
        } else {
          hint.textContent = "";
          hint.onclick = null;
        }
      }
    });
  }

  /* ── Public handlers ── */
  function _setYear(yr) {
    _year = yr; _currentWeek = null; _editComment = null;
    // Restore from server if this year has no local data yet, then render
    try {
      const stored = JSON.parse(localStorage.getItem(_sk(_year)) || "{}");
      if (!Object.keys(stored).length) {
        _restoreYearFromServer(_year).then(() => render());
        return; // render will be called after restore
      }
    } catch(e) {}
    render();
  }

  function _switchTab(tab) {
    _activeTab = tab;
    const trackerPanel  = document.getElementById("wt-tracker-panel");
    const historyPanel  = document.getElementById("wt-history-panel");
    const reopenedPanel = document.getElementById("wt-reopened-panel");
    const navStrip      = document.getElementById("wt-nav-strip");
    const histStrip     = document.getElementById("wt-hist-strip");
    if (trackerPanel)  trackerPanel.style.display  = tab==="tracker"?"block":"none";
    if (historyPanel)  historyPanel.style.display  = tab==="history"?"block":"none";
    if (reopenedPanel) reopenedPanel.style.display = tab==="reopened"?"block":"none";
    if (navStrip)      navStrip.style.display      = tab==="tracker"?"flex":"none";
    if (histStrip)     histStrip.style.display      = tab==="history"?"flex":"none";
    ["tracker","reopened","history"].forEach(t => {
      const btn = document.querySelector(`button[onclick="DashWeeklyTracker._switchTab('${t}')"]`);
      if (btn) {
        btn.style.fontWeight   = t===tab?"700":"500";
        btn.style.borderBottom = t===tab?"2px solid var(--blue)":"2px solid transparent";
        btn.style.color        = t===tab?"var(--blue)":"var(--text-secondary)";
      }
    });
    if (tab==="history")  _renderHistory();
    if (tab==="reopened") _renderReopened();
  }

  function _navClick(key) {
    _currentWeek=key; _editComment=null; _filterOwner=""; _filterCategory=""; _focusedCaseId=null;
    const weeks = _buildWeeks(_year);
    const allData = _ldy(_year);
    document.querySelectorAll(".wt-nb").forEach(b => {
      const a = b.dataset.wk === key;
      const cnt = (allData[b.dataset.wk]||[]).length;
      b.style.background   = a ? "var(--chart-1)" : "transparent";
      b.style.color        = a ? "var(--bg-ui)" : (cnt>0 ? "var(--text-primary)" : "var(--text-tertiary)");
      b.style.fontWeight   = a ? "700" : (cnt>0 ? "600" : "400");
      b.style.borderColor  = a ? "var(--chart-1)" : "transparent";
      b.style.boxShadow    = a ? "0 1px 4px rgba(15,98,254,.35)" : "none";
      // Re-bind hover so inactive buttons hover correctly after active changes
      b.onmouseover = a ? null : function(){ this.style.background="var(--bg-hover)"; this.style.borderColor="var(--border-subtle)"; };
      b.onmouseout  = a ? null : function(){ this.style.background="transparent"; this.style.borderColor="transparent"; };
    });
    _renderContent(weeks);
    document.querySelector(`.wt-nb[data-wk="${key}"]`)?.scrollIntoView({inline:"center",block:"nearest"});
  }

  function _jumpToToday() {
    const weeks = _buildWeeks(_year);
    const todayKey = _curCW(weeks);
    // If already on today's week, just pulse the button to confirm
    if (_currentWeek === todayKey) {
      const btn = document.getElementById('wt-today-btn');
      if (btn) { btn.textContent = '✓ Here!'; setTimeout(() => { btn.textContent = '⟲ Today'; }, 1200); }
      return;
    }
    _navClick(todayKey);
  }

  function _startEdit(id) { _editComment=id; _renderTable(_buildWeeks(_year)); }

  /* ── Comment Popover ── */
  let _activeCmtPopoverId = null;
  let _autoSaveTimer = null;
  /* _pastedLinkMap: populated on paste events from clipboard HTML.
     Maps display-text (lowercased) → { label, href } for any <a> tags
     found in rich-text pastes. Allows generic hyperlink detection
     regardless of the link format (TS, DT, URLs, etc.).
     Persisted to localStorage keyed by case number so links survive
     popover close/reopen. */
  let _pastedLinkMap = {};
  let _pastedLinkMapCaseNo = null; // case number currently loaded in _pastedLinkMap

  function _loadLinkMap(caseNo) {
    try {
      const store = JSON.parse(localStorage.getItem(LS_LINK_MAP_KEY) || "{}");
      return store[caseNo] || {};
    } catch(e) { return {}; }
  }
  function _saveLinkMap(caseNo, map) {
    try {
      const store = JSON.parse(localStorage.getItem(LS_LINK_MAP_KEY) || "{}");
      store[caseNo] = map;
      localStorage.setItem(LS_LINK_MAP_KEY, JSON.stringify(store));
    } catch(e) {}
  }

  function _openCmtPopover(id, triggerEl) {
    _closeCmtPopover(); // close any existing
    const rows = _wr(_year, _currentWeek);
    const row  = rows.find(r=>r.id===id); if(!row) return;
    const currentCmt = (_serverComments[row.caseNumber] !== undefined)
      ? _serverComments[row.caseNumber] : (row.comments || "");

    // Load any previously pasted links for this case from localStorage
    _pastedLinkMap = _loadLinkMap(row.caseNumber);
    _pastedLinkMapCaseNo = row.caseNumber;

    // Build severity badge inline
    const sev = String(row.severity||"").trim();
    const sevCol = sev.startsWith("1") ? "var(--chart-5)" : sev.startsWith("2") ? "var(--chart-7)" : sev.startsWith("3") ? "var(--yellow)" : "var(--text-tertiary)";
    const fmtDate = d => { if(!d) return "—"; const p=Utils.parseDate(d); return p ? p.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : d; };

    // Overlay backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "wt-cmt-backdrop";
    backdrop.style.cssText = "position:fixed;inset:0;z-index:699;background:rgba(0,0,0,.25);animation:wt-bd-in .18s ease";
    backdrop.addEventListener("mousedown", e => {
      const ta = document.getElementById("wt-pop-ta");
      if (ta) _doSaveCmt(id, ta.value, true);
      _closeCmtPopover();
      _renderTable(_buildWeeks(_year)); _renderWeekNav(_buildWeeks(_year));
    });
    document.body.appendChild(backdrop);

    // Drawer panel
    const pop = document.createElement("div");
    pop.id = "wt-cmt-popover";
    pop.style.cssText = "position:fixed;top:0;right:0;bottom:0;z-index:700;width:420px;max-width:96vw;background:var(--bg-layer,#fff);border-left:1px solid var(--border-subtle,var(--border-subtle));box-shadow:-8px 0 40px rgba(0,0,0,.14);display:flex;flex-direction:column;animation:wt-drawer-in .2s cubic-bezier(.4,0,.2,1)";
    pop.innerHTML = `
      <style>
        @keyframes wt-drawer-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes wt-bd-in{from{opacity:0}to{opacity:1}}
        #wt-autosave-status{transition:opacity .3s}
        .wt-info-card{background:var(--surface-1,#f4f4f4);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:12px 14px;flex:1;min-width:0}
        .wt-info-label{font-size:10px;font-weight:600;letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-tertiary);margin-bottom:4px}
        .wt-info-value{font-size:13px;font-weight:600;color:var(--text-primary);word-break:break-word}
      </style>

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-subtle,var(--border-subtle));flex-shrink:0">
        <div>
          <a href="https://www.ibm.com/mysupport/s/case/${Utils.escHtml(row.caseNumber)}" target="_blank"
             style="font-size:16px;font-weight:700;color:var(--ibm-blue-50,#0f62fe);text-decoration:none;font-family:var(--font-mono)">${Utils.escHtml(row.caseNumber)}</a>
          <div class="text-11 text-muted mt-6">Weekly Tracker · ${Utils.escHtml(_currentWeek||"")} · ${Utils.escHtml(_year)}</div>
        </div>
        <button onclick="DashWeeklyTracker._closeCmtPopover()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-tertiary);padding:4px 8px;border-radius:var(--radius-sm);line-height:1;transition:background var(--t-fast)" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'" title="Close (Esc)">×</button>
      </div>

      <!-- Info cards -->
      <div style="padding:16px 20px 0;flex-shrink:0">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div class="wt-info-card">
            <div class="wt-info-label">Owner</div>
            <div class="wt-info-value">${Utils.escHtml(row.owner||"—")}</div>
          </div>
          <div class="wt-info-card">
            <div class="wt-info-label">Status</div>
            <div class="wt-info-value" class="fs-12">${Utils.statusBadge ? Utils.statusBadge(row.status||"Closed") : Utils.escHtml(row.status||"Closed")}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
          <div class="wt-info-card">
            <div class="wt-info-label">Severity</div>
            <div class="wt-info-value" style="color:${sevCol}">${Utils.escHtml(sev||"—")}</div>
          </div>
          <div class="wt-info-card">
            <div class="wt-info-label">Closed Date</div>
            <div class="wt-info-value" style="font-size:12px;font-family:var(--font-mono)">${fmtDate(row.closedDate)}</div>
          </div>
          <div class="wt-info-card">
            <div class="wt-info-label">Category</div>
            <div class="wt-info-value" class="fs-12">${Utils.escHtml(row.category||"—")}</div>
          </div>
        </div>

        <!-- Title -->
        <div style="background:var(--surface-1,#f4f4f4);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:16px">
          <div class="wt-info-label">Title</div>
          <div style="font-size:12px;color:var(--text-primary);line-height:1.5">${Utils.escHtml(row.title||"—")}</div>
        </div>
      </div>

      <!-- Comment section -->
      <div style="padding:0 20px;flex:1;display:flex;flex-direction:column;min-height:0">
        <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px;display:flex;align-items:center;gap:6px">
          ✏️ Comment
          <span id="wt-autosave-status" style="font-size:10px;font-weight:400;color:var(--text-tertiary)">Ctrl+Enter to save</span>
        </div>
        <textarea id="wt-pop-ta" rows="6"
          style="flex:1;width:100%;box-sizing:border-box;resize:none;font-size:13px;line-height:1.6;
            font-family:inherit;border:1px solid var(--border-subtle);border-radius:var(--radius-md);
            padding:12px 14px;background:var(--surface-1,#f4f4f4);color:var(--text-primary);
            outline:none /* focus-visible handles focus ring */;transition:border .15s;min-height:120px"
          placeholder="Add a comment for this case…"
          onfocus="this.style.border='1px solid var(--ibm-blue-50)';this.style.background='var(--bg-layer,#fff)'"
          onblur="this.style.border='1px solid var(--border-subtle,var(--border-subtle))';this.style.background='var(--surface-1,#f4f4f4)'"
          onkeydown="DashWeeklyTracker._popKey(event,'${id}')"
          oninput="DashWeeklyTracker._onCmtInput('${id}',this)"
        >${Utils.escHtml(currentCmt)}</textarea>
        <div style="font-size:10px;color:var(--text-tertiary);font-family:var(--font-mono);margin-top:4px">
          <span id="wt-pop-count">${currentCmt.length} chars</span>
        </div>
        <!-- URL preview — shown when comment contains links -->
        <div id="wt-pop-urlpreview" style="display:${_buildUrlPreview(currentCmt)?'block':'none'};margin-top:8px;padding:8px 12px;border-radius:var(--radius-sm);background:rgba(15,98,254,.04);border:1px solid rgba(15,98,254,.15)">
          <div style="font-size:10px;font-weight:600;color:var(--ibm-blue-50);margin-bottom:5px;letter-spacing:.04em;text-transform:none">🔗 Links in comment</div>
          <div id="wt-pop-urllist" style="display:flex;flex-direction:column;gap:4px;font-size:11px">${_buildUrlPreview(currentCmt)}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="display:flex;gap:10px;justify-content:flex-end;padding:16px 20px;border-top:1px solid var(--border-subtle,var(--border-subtle));flex-shrink:0;margin-top:12px">
        <button onclick="DashWeeklyTracker._closeCmtPopover()" class="btn btn-ghost btn-sm" style="min-width:80px">Cancel</button>
        <button onclick="DashWeeklyTracker._saveCmtPopover('${id}')" class="btn btn-primary btn-sm" style="min-width:100px">💾 Save</button>
      </div>`;
    document.body.appendChild(pop);

    const ta = document.getElementById("wt-pop-ta");
    if (ta) {
      ta.focus(); ta.selectionStart = ta.value.length; ta.selectionEnd = ta.value.length;
      // Intercept paste: extract hyperlinks from clipboard rich-text (HTML) generically.
      // When a user copies text that contains hyperlinks (e.g. from a browser or email),
      // the clipboard carries both plain text and HTML. We parse the HTML to find <a> tags
      // and populate _pastedLinkMap so _buildUrlPreview can surface those links.
      ta.addEventListener("paste", function _onCmtPaste(e) {
        const html = e.clipboardData && e.clipboardData.getData("text/html");
        if (!html) return;
        // Parse the clipboard HTML in a sandboxed inert container (no scripts run)
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        tmp.querySelectorAll("a[href]").forEach(a => {
          const href = a.href; // absolute URL resolved by browser
          const label = (a.textContent || "").trim();
          if (!href || !label || /^(javascript|mailto):/i.test(href)) return;
          // Key by lowercased label so we can match against textarea plain text
          _pastedLinkMap[label.toLowerCase()] = { label, href };
        });
        // Persist the updated map for this case so links survive popover close/reopen
        if (_pastedLinkMapCaseNo) _saveLinkMap(_pastedLinkMapCaseNo, _pastedLinkMap);
        // After paste, textarea value updates asynchronously — use setTimeout(0)
        // to trigger preview update once the pasted plain text is in ta.value
        setTimeout(() => {
          const urlPreview = document.getElementById("wt-pop-urlpreview");
          const urlList    = document.getElementById("wt-pop-urllist");
          if (urlPreview && urlList) {
            const previewHtml = _buildUrlPreview(ta.value);
            if (previewHtml) {
              urlList.innerHTML = previewHtml;
              urlPreview.style.display = "block";
            } else {
              urlPreview.style.display = "none";
            }
          }
        }, 0);
      });
    }
    _activeCmtPopoverId = id;
  }

  function _onCmtInput(id, ta) {
    // Update char count
    const countEl = document.getElementById("wt-pop-count");
    if (countEl) countEl.textContent = ta.value.length + " chars";
    // Update live URL preview panel
    const urlPreview = document.getElementById("wt-pop-urlpreview");
    const urlList    = document.getElementById("wt-pop-urllist");
    if (urlPreview && urlList) {
      const html = _buildUrlPreview(ta.value);
      if (html) {
        urlList.innerHTML = html;
        urlPreview.style.display = "block";
      } else {
        urlPreview.style.display = "none";
      }
    }
    // Show "Saving…" indicator
    const statusEl = document.getElementById("wt-autosave-status");
    if (statusEl) { statusEl.textContent = "⏳ Saving…"; statusEl.style.color = "var(--text-tertiary)"; }
    // Debounce: save 1.2s after user stops typing
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => {
      _doSaveCmt(id, ta.value, /* silent */ true);
      if (statusEl) {
        statusEl.textContent = "✅ Saved";
        statusEl.style.color = "var(--green)";
        setTimeout(() => {
          if (statusEl) { statusEl.textContent = "Ctrl+Enter to save · Esc to close"; statusEl.style.color = "var(--text-tertiary)"; }
        }, 2000);
      }
    }, 1200);
  }

  function _doSaveCmt(id, value, silent) {
    const rows = _wr(_year, _currentWeek);
    const row  = rows.find(r=>r.id===id); if(!row) return;
    const oldCmt = _serverComments[row.caseNumber] !== undefined
      ? _serverComments[row.caseNumber] : (row.comments || "");
    const newCmt = value.trim();
    if (oldCmt === newCmt) return; // nothing changed
    _serverComments[row.caseNumber] = newCmt;
    _saveServerComments();
    const lsRows = _ldy(_year)[_currentWeek] || [];
    const lsRow  = lsRows.find(r => r.id === id);
    if (lsRow) { lsRow.comments = ""; _swk(_year, _currentWeek, lsRows); }
    _recordHistory(row.caseNumber, row.owner, row.status, row.status, oldCmt, newCmt, _currentWeek, _year);
    // Silently refresh the background cells without closing popover
    _renderKPI(); _renderFollowUp();
    const tbl = document.getElementById("wt-table-wrap");
    if (tbl) {
      // Update just the trigger cell text to reflect new comment without full re-render
      const trig = document.getElementById("wt-cmttrig-" + id);
      if (trig) {
        const td = trig.parentElement;
        if (newCmt) {
          // Has comment — blue accent
          trig.style.background = "rgba(15,98,254,.04)";
          trig.style.borderColor = "rgba(15,98,254,.15)";
          if (td) { td.style.background="rgba(15,98,254,.03)"; td.style.borderLeftColor="rgba(15,98,254,.2)"; td.style.borderRightColor="rgba(15,98,254,.2)"; }
          const preview = newCmt.length > 80 ? newCmt.slice(0,80) : newCmt;
          const more = newCmt.length > 80 ? `<span style="color:var(--ibm-blue-50);font-size:10px;font-weight:600;margin-left:3px">…more</span>` : "";
          trig.innerHTML = `<div style="display:flex;flex-direction:column;gap:4px">
            <span style="font-size:11px;line-height:1.5;color:var(--text-primary);font-weight:500">${_linkify(preview)}${more}</span>
            <span style="font-size:9px;color:var(--text-tertiary);font-family:var(--font-mono)">${newCmt.length} chars</span>
          </div>`;
        } else {
          // Empty — amber accent + pulse
          trig.style.background = "rgba(245,158,11,.04)";
          trig.style.borderColor = "rgba(245,158,11,.25)";
          if (td) { td.style.background="rgba(245,158,11,.05)"; td.style.borderLeftColor="rgba(245,158,11,.4)"; td.style.borderRightColor="rgba(245,158,11,.4)"; }
          trig.innerHTML = `<span class="wt-cmt-empty" style="display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:var(--radius-sm);background:rgba(245,158,11,.1);border:1.5px dashed rgba(245,158,11,.5);color:var(--yellow-text);font-size:10px;font-weight:600;white-space:nowrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Add note</span>`;
        }
      }
    }
    if (!silent) _toast("Comment saved");
  }

  function _popoverOutsideClick(e) {
    const pop = document.getElementById("wt-cmt-popover");
    if (pop && !pop.contains(e.target)) {
      const trig = document.getElementById("wt-cmttrig-" + _activeCmtPopoverId);
      if (trig && trig.contains(e.target)) return;
      // Auto-save current value before closing
      const ta = document.getElementById("wt-pop-ta");
      if (ta) _doSaveCmt(_activeCmtPopoverId, ta.value, true);
      _closeCmtPopover();
      _renderTable(_buildWeeks(_year)); _renderWeekNav(_buildWeeks(_year));
    }
  }
  function _closeCmtPopover() {
    clearTimeout(_autoSaveTimer);
    document.removeEventListener("mousedown", _popoverOutsideClick);
    const pop = document.getElementById("wt-cmt-popover");
    if (pop) pop.remove();
    const bd = document.getElementById("wt-cmt-backdrop");
    if (bd) bd.remove();
    _activeCmtPopoverId = null;
    _pastedLinkMap = {}; // reset paste-captured links for next session
  }
  function _popKey(e, id) {
    if (e.key === "Escape") { e.preventDefault();
      const ta = document.getElementById("wt-pop-ta");
      if (ta) _doSaveCmt(id, ta.value, true);
      _closeCmtPopover();
      _renderTable(_buildWeeks(_year)); _renderWeekNav(_buildWeeks(_year));
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); _saveCmtPopover(id); }
    // Arrow key navigation between rows in drawer (#12)
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.altKey) {
      e.preventDefault();
      const ta = document.getElementById("wt-pop-ta");
      if (ta) _doSaveCmt(id, ta.value, true);
      const rows = _wr(_year, _currentWeek);
      const idx  = rows.findIndex(r => r.id === id);
      const next = e.key === "ArrowDown" ? rows[idx+1] : rows[idx-1];
      if (!next) return;
      _closeCmtPopover();
      setTimeout(() => {
        const trig = document.getElementById("wt-cmttrig-" + next.id);
        if (trig) _openCmtPopover(next.id, trig);
      }, 50);
    }
  }
  function _saveCmtPopover(id) {
    clearTimeout(_autoSaveTimer);
    const ta = document.getElementById("wt-pop-ta"); if(!ta) return;
    _doSaveCmt(id, ta.value, false);
    _closeCmtPopover();
    _editComment=null; _renderKPI(); _renderFollowUp(); _renderTable(_buildWeeks(_year)); _renderWeekNav(_buildWeeks(_year));
  }

  function _saveCmt(id) { _saveCmtPopover(id); }
  function _cmtKey(e,id) {
    if (e.key==="Escape") { _editComment=null; _renderTable(_buildWeeks(_year)); }
    if (e.key==="Enter"&&(e.ctrlKey||e.metaKey)) _saveCmt(id);
  }

  function _setCat(id, val) {
    const rows = _wr(_year, _currentWeek);
    const row = rows.find(r=>r.id===id);
    if (row) { row.category=_normCat(val); _swk(_year,_currentWeek,rows); _renderWeekNav(_buildWeeks(_year)); _renderTable(_buildWeeks(_year)); }
  }

  function _editRow(id) { const r=_wr(_year,_currentWeek).find(r=>r.id===id); if(r) _openModal(r,_buildWeeks(_year)); }

  // Categories that trigger the follow-up alert and require a history entry
  const _ALERT_AVAILABILITIES = new Set(["Not Joined", "On Leave", "Follow Up", "Reopened"]);

  function _setAvailability(id, val) {
    const rows = _wr(_year, _currentWeek);
    const row = rows.find(r=>r.id===id);
    if (row) {
      const prevAvail = row.availability || "";
      row.availability = val;
      _swk(_year, _currentWeek, rows);
      // Auto-record a history entry whenever an alert-category availability is set
      // and it differs from the previous value — history stays even when alert is cleared
      if (_ALERT_AVAILABILITIES.has(val) && val !== prevAvail) {
        const cmt = (_serverComments[row.caseNumber] !== undefined)
          ? _serverComments[row.caseNumber] : (row.comments || "");
        _recordHistory(row.caseNumber, row.owner, row.status, row.status,
          cmt, cmt, _currentWeek, _year, val);
      }
      _renderFollowUp();
      _renderWeekNav(_buildWeeks(_year));
      _renderTable(_buildWeeks(_year)); // refresh history badge counts
    }
  }

  function _delRow(id) {
    if(!confirm("Remove this case?")) return;
    _swk(_year,_currentWeek,_wr(_year,_currentWeek).filter(r=>r.id!==id));
    _renderKPI(); _renderFollowUp(); _renderTable(_buildWeeks(_year)); _renderWeekNav(_buildWeeks(_year)); _toast("Removed");
  }

  function _exportCSV() { _exportYearCSV(); } // legacy alias
  function _exportYearCSV() {
    if (typeof XLSX === "undefined") {
      _toast("Excel library not loaded yet — please wait a moment and try again", true);
      return;
    }
    const allData  = _ldy(_year);
    const headers  = ["Sl.No","Case Owner","Case Number","Title","Product","Severity","Status","Age","Closed Date","Comments","Category","Availability"];
    const weeks    = _buildWeeks(_year);

    const wb = XLSX.utils.book_new();

    // ── Sheet per week ──────────────────────────────────────────────
    let totalCases = 0;
    const summaryRows = [["Week","Week Range","Total Cases","With Comments","Without Comments","Attended","Not Joined","On Leave","Follow Up","Reopened"]];

    weeks.forEach(w => {
      const rows = _wr(_year, w.key);
      if (!rows.length) return; // skip empty weeks

      const sheetData = [headers];
      rows.forEach((r, i) => {
        const cmt = (_serverComments[r.caseNumber] !== undefined && _serverComments[r.caseNumber] !== "")
          ? _serverComments[r.caseNumber] : (r.comments || "");
        sheetData.push([
          i+1, r.owner||"", r.caseNumber||"", r.title||"", r.product||"",
          r.severity ? Number(r.severity) : "", r.status||"", r.age||"",
          r.closedDate||"", cmt, r.category||"", r.availability||""
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Column widths
      ws["!cols"] = [
        {wch:6},{wch:18},{wch:14},{wch:42},{wch:14},
        {wch:6},{wch:12},{wch:10},{wch:14},{wch:50},{wch:24},{wch:14}
      ];

      // Style header row bold + background (using SheetJS cell styles where supported)
      const headerRange = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
        const addr = XLSX.utils.encode_cell({r:0, c:C});
        if (!ws[addr]) continue;
        ws[addr].s = {
          font: { bold: true, sz: 10 },
          fill: { fgColor: { rgb: "1A56DB" } },
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
          alignment: { horizontal: "center" }
        };
      }
      // Highlight comment column header (index 9) in amber
      const cmtHdrAddr = XLSX.utils.encode_cell({r:0, c:9});
      if (ws[cmtHdrAddr]) ws[cmtHdrAddr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
        fill: { fgColor: { rgb: "D97706" } },
        alignment: { horizontal: "center" }
      };
      // Highlight comment cells that are empty
      for (let R = 1; R <= rows.length; R++) {
        const addr = XLSX.utils.encode_cell({r:R, c:9});
        if (ws[addr] && (!ws[addr].v || ws[addr].v === "")) {
          ws[addr].s = { fill: { fgColor: { rgb: "FEF3C7" } }, font: { italic: true, color: { rgb: "92400E" } } };
          ws[addr].v = "⚠ No comment";
        }
      }

      // Sheet name: "W03", "W04" etc (max 31 chars)
      const sheetName = w.key.replace("CW","W") + " " + w.range.slice(0,16);
      XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0,31));

      // Summary stats for this week
      const withCmt  = rows.filter(r => { const c = (_serverComments[r.caseNumber]||r.comments||"").trim(); return c !== ""; }).length;
      const avCount  = v => rows.filter(r => r.availability === v).length;
      summaryRows.push([
        w.key.replace("CW","W"), w.range,
        rows.length, withCmt, rows.length - withCmt,
        avCount("Attended"), avCount("Not Joined"), avCount("On Leave"),
        avCount("Follow Up"), avCount("Reopened")
      ]);
      totalCases += rows.length;
    });

    if (totalCases === 0) { _toast("No data for " + _year, true); return; }

    // ── Summary sheet (first sheet) ──────────────────────────────────
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    summaryWs["!cols"] = [{wch:8},{wch:28},{wch:13},{wch:15},{wch:18},{wch:11},{wch:12},{wch:11},{wch:12},{wch:10}];
    // Bold + blue header
    const sr = XLSX.utils.decode_range(summaryWs["!ref"]);
    for (let C = sr.s.c; C <= sr.e.c; C++) {
      const addr = XLSX.utils.encode_cell({r:0, c:C});
      if (!summaryWs[addr]) continue;
      summaryWs[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
        fill: { fgColor: { rgb: "1A56DB" } },
        alignment: { horizontal: "center" }
      };
    }
    // Highlight "Without Comments" column (index 4) in amber for rows with missing comments
    for (let R = 1; R < summaryRows.length; R++) {
      const addr = XLSX.utils.encode_cell({r:R, c:4});
      if (summaryWs[addr] && summaryWs[addr].v > 0) {
        summaryWs[addr].s = { fill: { fgColor: { rgb: "FEF3C7" } }, font: { bold: true, color: { rgb: "92400E" } } };
      }
    }
    // Insert summary as first sheet
    XLSX.utils.book_append_sheet(wb, summaryWs, "📊 Summary");
    // Move summary to front
    wb.SheetNames.unshift(wb.SheetNames.pop());

    // ── Write file ───────────────────────────────────────────────────
    XLSX.writeFile(wb, "Closed_Cases_" + _year + "_FullYear.xlsx");
    _toast("✅ Exported " + totalCases + " cases across " + (summaryRows.length-1) + " weeks for " + _year);
  }

  /* ── Modal ── */
  let _editId = null;
  function _openModal(rowData, weeks) {
    _editId=rowData?.id||null;
    const modal=document.getElementById("wt-modal"); if(!modal) return;
    const members=(() => { try { return Contacts.teamMembers(); } catch(e) { return []; } })();
    // Build owner list — include the existing row owner even if not in members list
    const ownerSet = new Set(members);
    if (rowData && rowData.owner) ownerSet.add(rowData.owner);
    const ownerList = [...ownerSet].sort();
    document.getElementById("wm-owner").innerHTML='<option value="">Select owner\u2026</option>'+
      ownerList.map(m=>`<option value="${Utils.escHtml(m)}">${Utils.escHtml(m)}</option>`).join("");
    document.getElementById("wt-mtitle").textContent=rowData?"Edit Case":"Add Closed Case";
    document.getElementById("wt-msave").textContent=rowData?"Save Changes":"Add Case";
    if (rowData) {
      // Normalize closedDate to YYYY-MM-DD for date input
      let isoDate = "";
      if (rowData.closedDate) {
        // Handle various date formats
        const raw = rowData.closedDate.trim();
        const d = new Date(raw);
        if (!isNaN(d)) {
          isoDate = d.toISOString().split("T")[0];
        } else {
          // Try DD Mon YYYY format
          isoDate = raw.slice(0,10);
        }
      }
      // Set owner — must be done AFTER innerHTML is set
      const ownerSel = document.getElementById("wm-owner");
      if (ownerSel) {
        ownerSel.value = rowData.owner || "";
        // If not found in list, add it and select it
        if (ownerSel.value !== (rowData.owner||"") && rowData.owner) {
          const opt = document.createElement("option");
          opt.value = rowData.owner;
          opt.textContent = rowData.owner;
          ownerSel.appendChild(opt);
          ownerSel.value = rowData.owner;
        }
      }
      [["wm-cn","caseNumber"],["wm-title","title"],["wm-prod","product"],["wm-sev","severity"],
       ["wm-status","status"],["wm-age","age"],["wm-cmt","comments"]
      ].forEach(([id,k]) => { const e=document.getElementById(id); if(e) e.value=rowData[k]||""; });
      const clEl=document.getElementById("wm-closed"); if(clEl) clEl.value=isoDate;
      // Set category separately to ensure correct option is selected
      const catSel=document.getElementById("wm-cat");
      if(catSel) { catSel.value=_normCat(rowData.category||""); }
      // Make case number readonly when editing (it's the identifier)
      const cnEl=document.getElementById("wm-cn");
      if(cnEl){ cnEl.readOnly=true; cnEl.style.background="var(--bg-hover)"; cnEl.style.color="var(--text-tertiary)"; cnEl.style.cursor="default"; }
      // Clear any leftover category suggestion hint
      const hint=document.getElementById("wm-cat-suggest"); if(hint) hint.textContent="";
    } else {
      ["wm-cn","wm-title","wm-prod","wm-age","wm-cmt"].forEach(id => { const e=document.getElementById(id); if(e) e.value=""; });
      const sevEl=document.getElementById("wm-sev"); if(sevEl) sevEl.value="";
      const catEl=document.getElementById("wm-cat"); if(catEl) catEl.value="";
      const st=document.getElementById("wm-status"); if(st) st.value="Closed by IBM";
      const cl=document.getElementById("wm-closed"); if(cl) cl.value=new Date().toISOString().split("T")[0];
      // Make case number editable for new case
      const cnEl=document.getElementById("wm-cn");
      if(cnEl){ cnEl.readOnly=false; cnEl.style.background=""; cnEl.style.color=""; cnEl.style.cursor=""; }
      // Clear suggestion hint
      const hint=document.getElementById("wm-cat-suggest"); if(hint) hint.textContent="";
    }
    modal.style.display="flex";
    setTimeout(()=>{ if(!rowData) document.getElementById("wm-cn")?.focus(); else document.getElementById("wm-title")?.focus(); },80);
  }
  function _closeModal() { const m=document.getElementById("wt-modal"); if(m) m.style.display="none"; _editId=null; }
  function _saveModal(weeks) {
    const owner=document.getElementById("wm-owner")?.value.trim();
    const cn=document.getElementById("wm-cn")?.value.trim();
    const title=document.getElementById("wm-title")?.value.trim();
    if(!owner||!cn||!title){_toast("Owner, Case Number and Title required",true);return;}
    const rows=_wr(_year,_currentWeek);
    const oldRow=_editId?rows.find(r=>r.id===_editId):null;
    // Dedup guard: block adding a case that already exists in this week (new case only)
    if (!_editId && rows.some(r => r.caseNumber === cn)) {
      _toast("Case " + cn + " already exists in " + _currentWeek, true);
      return;
    }
    const row={
      id:_editId||(cn+"_"+_currentWeek+"_"+Date.now().toString(36)),
      owner, caseNumber:cn, title,
      product:document.getElementById("wm-prod")?.value.trim()||"",
      severity:document.getElementById("wm-sev")?.value||"",
      status:document.getElementById("wm-status")?.value.trim()||"Closed by IBM",
      age:document.getElementById("wm-age")?.value.trim()||"",
      closedDate:document.getElementById("wm-closed")?.value||"",
      category:_normCat(document.getElementById("wm-cat")?.value||""),
      comments:document.getElementById("wm-cmt")?.value.trim()||"",
      availability: oldRow ? (oldRow.availability||"") : "",
      customerNumber:"", created:"", solutionDate:"", addedAt:new Date().toISOString()
    };
    // Record history if status or comment changed
    if (oldRow && (oldRow.status!==row.status || oldRow.comments!==row.comments))
      _recordHistory(cn, owner, oldRow.status, row.status, oldRow.comments, row.comments, _currentWeek, _year);

    // Persist comment to server-side store; strip it from the localStorage row
    if (row.comments !== undefined) {
      _serverComments[cn] = row.comments;
      _saveServerComments();
    }
    row.comments = ""; // do not persist in localStorage

    if(_editId){const i=rows.findIndex(r=>r.id===_editId); if(i>=0)rows[i]=row; else rows.push(row); _toast("Updated");}
    else{rows.push(row);_toast("Added to "+_currentWeek);}
    _swk(_year,_currentWeek,rows); _closeModal(); _renderKPI(); _renderFollowUp(); _renderTable(weeks); _renderWeekNav(weeks);
  }

  /* ── Bulk action handlers (#7) ── */
  function _selRow(id, checked) {
    if (checked) _selectedRows.add(id); else _selectedRows.delete(id);
    _updateBulkBar();
    // Update row highlight without full re-render
    const tr = document.querySelector(`input[onchange*="_selRow('${id}"]`)?.closest("tr");
    if (tr) tr.style.outline = checked ? "2px solid rgba(15,98,254,.35)" : "";
  }
  function _selAll(checked) {
    const rows = _wr(_year, _currentWeek);
    rows.forEach(r => { if (checked) _selectedRows.add(r.id); else _selectedRows.delete(r.id); });
    _renderTable(_buildWeeks(_year));
  }
  function _updateBulkBar() {
    const bar = document.getElementById("wt-bulk-bar");
    const cnt = document.getElementById("wt-bulk-count");
    if (!bar || !cnt) return;
    if (_selectedRows.size > 0) {
      bar.style.display = "flex";
      cnt.textContent = `${_selectedRows.size} selected`;
    } else {
      bar.style.display = "none";
    }
  }
  function _bulkSetCat(val) {
    if (!val || !_selectedRows.size) return;
    const rows = _wr(_year, _currentWeek);
    rows.forEach(r => { if (_selectedRows.has(r.id)) r.category = _normCat(val); });
    _swk(_year, _currentWeek, rows);
    _renderTable(_buildWeeks(_year));
    _toast(`Category set for ${_selectedRows.size} cases`);
  }
  function _bulkSetAv(val) {
    if (!_selectedRows.size) return;
    const rows = _wr(_year, _currentWeek);
    rows.forEach(r => { if (_selectedRows.has(r.id)) r.availability = val; });
    _swk(_year, _currentWeek, rows);
    _renderFollowUp(); _renderTable(_buildWeeks(_year));
    _toast(`Availability set for ${_selectedRows.size} cases`);
  }
  function _clearBulk() {
    _selectedRows.clear();
    _renderTable(_buildWeeks(_year));
  }

  /* ── History CSV export (#11) ── */
  function _exportHistoryCSV() {
    const h = _loadHistory();
    if (!Object.keys(h).length) { _toast("No history to export", true); return; }
    const rows = [["Case Number","Owner","Date","Week","Year","Status Before","Status After","Comment After","Type"]];
    Object.values(h).forEach(item => {
      item.entries.forEach(e => {
        rows.push([
          item.caseNumber, item.owner||"",
          e.ts ? new Date(e.ts).toLocaleString("en-GB") : "",
          e.week||"", e.year||"",
          e.statusBefore||"", e.statusAfter||"",
          e.commentAfter||"",
          e.isReopen ? "Reopen" : e.availability || "Comment/Edit"
        ]);
      });
    });
    const csv = rows.map(r => r.map(v => '"'+String(v||"").replace(/"/g,'""')+'"').join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "case_history_" + new Date().toISOString().slice(0,10) + ".csv";
    a.click();
    _toast("History exported as CSV — " + (rows.length-1) + " entries");
  }

  function _toast(msg, isErr) {
    let t = document.getElementById("wt-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "wt-toast";
      t.style.cssText = [
        "position:fixed",
        "bottom:28px",
        "left:50%",
        "transform:translateX(-50%) translateY(12px)",
        "z-index:var(--z-modal)9",
        "padding:10px 22px",
        "border-radius:var(--radius-sm)",
        "font-size:13px",
        "font-weight:500",
        "letter-spacing:0.01em",
        "box-shadow:0 4px 18px rgba(0,0,0,0.18)",
        "display:flex",
        "align-items:center",
        "gap:8px",
        "pointer-events:none",
        "opacity:0",
        "transition:opacity var(--transition-base), transform var(--transition-base)",
        "font-family:var(--font-sans,'IBM Plex Sans',sans-serif)",
        "white-space:nowrap"
      ].join(";");
      document.body.appendChild(t);
    }
    // Atlassian blue for success, red for error
    const bg  = isErr ? "var(--red)" : "var(--ibm-blue-50)";
    const ico = isErr
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    t.style.background = bg;
    t.style.color = "#fff";
    t.innerHTML = `${ico}<span>${Utils.escHtml(msg)}</span>`;
    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        t.style.opacity = "1";
        t.style.transform = "translateX(-50%) translateY(0)";
      });
    });
    clearTimeout(t._t);
    t._t = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(12px)";
    }, 2400);
  }

  /* ── Category picker popover (#3) ── */
  let _activeCatPicker = null;
  function _openCatPicker(id, trigEl) {
    _closeCatPicker();
    const rect = trigEl.getBoundingClientRect();
    const CAT_COLORS_PICKER = {
      "Issue Fixed in iFix":           "var(--green)",
      "LQE Validation / Reindexing":   "var(--ibm-blue-60)",
      "Export / Import Issues":        "var(--yellow-text)",
      "Known Defect":                  "var(--red)",
      "Out of Memory / Heap Issues":   "#c00",
      "TRS Feed Validation":           "var(--ibm-blue-50)",
      "Insufficient Information in Logs": "#555",
      "Single Occurrence Issue":       "var(--purple)",
      "DCM Connectivity Issues":       "var(--orange)",
      "Database Connectivity Issues":  "var(--orange)",
      "Backup & Restore":             "var(--red)",
    };
    const picker = document.createElement("div");
    picker.id = "wt-cat-picker";
    picker.style.cssText = `position:fixed;z-index:900;background:var(--bg-layer);border:1px solid var(--border-subtle);
      border-radius:var(--radius-md);box-shadow:0 8px 32px rgba(0,0,0,.18);padding:8px;width:210px;
      top:${Math.min(rect.bottom+4, window.innerHeight-280)}px;left:${Math.min(rect.left, window.innerWidth-220)}px;
      animation:wt-picker-in .14s ease`;
    picker.innerHTML = `<style>@keyframes wt-picker-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}</style>
      <div style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);padding:2px 6px 6px;border-bottom:1px solid var(--border-subtle);margin-bottom:6px">Set Category</div>
      ${WT_CATEGORIES.map(cat => {
        const color = CAT_COLORS_PICKER[cat] || "#555";
        return `<div onclick="DashWeeklyTracker._pickCat('${id}','${cat.replace(/'/g,"\'")}',this)" 
          style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--radius-sm);cursor:pointer;transition:background var(--t-fast)"
          onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
          <span style="font-size:11px;color:var(--text-primary)">${Utils.escHtml(cat)}</span>
        </div>`;
      }).join("")}
      <div onclick="DashWeeklyTracker._pickCat('${id}','',this)"
        style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--radius-sm);cursor:pointer;border-top:1px solid var(--border-subtle);margin-top:4px;transition:background var(--t-fast)"
        onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--text-disabled);flex-shrink:0"></span>
        <span style="font-size:11px;color:var(--text-tertiary);font-style:italic">Clear category</span>
      </div>`;
    document.body.appendChild(picker);
    _activeCatPicker = id;
    setTimeout(() => document.addEventListener("mousedown", _catPickerOutside), 0);
  }
  function _catPickerOutside(e) {
    const p = document.getElementById("wt-cat-picker");
    if (p && !p.contains(e.target)) _closeCatPicker();
  }
  function _closeCatPicker() {
    document.removeEventListener("mousedown", _catPickerOutside);
    const p = document.getElementById("wt-cat-picker"); if (p) p.remove();
    _activeCatPicker = null;
  }
  function _pickCat(id, val, el) {
    _closeCatPicker();
    _setCat(id, val);
  }

  function _sortBy(col) {
    if (_sortCol === col) { _sortDir = -_sortDir; }
    else { _sortCol = col; _sortDir = 1; }
    _renderTable(_buildWeeks(_year));
  }

  // ── Rename owner names stored in tracker localStorage ──────────────────
  // Called after admin renames a team member so all historical tracker rows update.
  function renameInTracker(renameMap) {
    if (!renameMap || !Object.keys(renameMap).length) return;
    // Find all tracker year keys in storage
    const yearKeys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORE_PREFIX)) yearKeys.push(k);
      }
    } catch(e) { return; }

    yearKeys.forEach(key => {
      try {
        const yearData = JSON.parse(localStorage.getItem(key) || "{}");
        let changed = false;
        Object.keys(yearData).forEach(wk => {
          if (!Array.isArray(yearData[wk])) return;
          yearData[wk] = yearData[wk].map(row => {
            const newOwner = renameMap[row.owner];
            if (!newOwner) return row;
            changed = true;
            return { ...row, owner: newOwner };
          });
        });
        if (changed) localStorage.setItem(key, JSON.stringify(yearData));
      } catch(e) {}
    });

    // Also rename in change history
    try {
      const h = _loadHistory();
      let hChanged = false;
      Object.keys(h).forEach(cn => {
        if (renameMap[h[cn].owner]) { h[cn].owner = renameMap[h[cn].owner]; hChanged = true; }
      });
      if (hChanged) _saveHistory(h);
    } catch(e) {}
  }

  return { render, enrichFromCases, renameInTracker, _setYear, _switchTab, _renderReopened, _dismissReopen, _navClick, _jumpToToday, _toggleFollowup, _focusCase, _clearFocusCase, _startEdit, _saveCmt, _cmtKey, _setCat, _setAvailability, _editRow, _delRow, _normCat, _sortBy, _applySeed, _mergeServerComments, _mergeServerCommentsNoOverwrite, _ensureServerCommentsLoaded, _openCmtPopover, _closeCmtPopover, _saveCmtPopover, _popKey, _onCmtInput, _doSaveCmt, _setChip, _clearChips, _openCatPicker, _closeCatPicker, _pickCat, _selRow, _selAll, _clearBulk, _bulkSetCat, _bulkSetAv, _renderHistoryFiltered, get _serverComments() { return _serverComments; } };

})();