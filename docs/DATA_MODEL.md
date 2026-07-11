# Initial Data Model

## Subject
- id
- name
- color
- createdAt

## Chapter
- id
- subjectId
- name
- confidence: weak | okay | strong
- status: not_started | learning | revised

## Homework
- id
- subjectId
- chapterId
- title
- dueDate
- completed

## Exam
- id
- name
- date
- chapterIds

## Resource
- id
- subjectId
- chapterId
- title
- type
- location

## RevisionTask
- id
- chapterId
- scheduledDate
- completed
- reason