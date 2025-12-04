---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
status: "current"  # current | completed
level: "masters"   # phd | masters | undergraduate
thesis_title: ""
start_year: {{ now.Format "2006" }}
year_completed: 
cosupervisor: ""
current_position: ""  # For alumni - where are they now
website: ""
orcid: ""
linkedin: ""
thesis_url: ""
---
