# ZIVOZONE V15 — 10-second question timer

Based on the working V11/V14 build.

Changes:
- Every challenge question has a 10-second countdown.
- "Who Am I?" 20-question test also has 10 seconds per question.
- Timeout automatically moves to the next question.
- Timeout does not reveal the correct answer.
- Normal challenges count timeout as an unanswered/incorrect item.
- Dark Room keeps its no-right/wrong-answer experience.
- Countdown is visible, animated, and becomes urgent during the last 3 seconds.
- Existing Firebase, authentication, challenge banks, audio, news, ads, languages, and other features are preserved.
- Added small timer audio cues through the existing challenge-only audio system.
