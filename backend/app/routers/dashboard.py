from fastapi import APIRouter, Depends, HTTPException
from ..core.security import get_current_user
from ..models.user import UserOut
# In app/models/dashboard.py, add `streak: int` to the DashboardData model
from ..models.dashboard import DashboardData, PerformanceHistoryItem, InterviewHistoryItem
from ..core.db import interview_sessions_collection
import datetime
from typing import List

router = APIRouter()

@router.get("/", response_model=DashboardData)
async def get_dashboard_data(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Fetches and computes all data required for the user's dashboard from the database.
    """

    # Fetch all sessions for the current user, sorted by date
    sessions_cursor = interview_sessions_collection.find(
        {"user_id": str(current_user.id)}
    ).sort("date", -1)
    sessions: List[dict] = await sessions_cursor.to_list(length=100)

    interview_count = len(sessions)
    average_score = 0
    best_score = 0
    streak = 0
    last_interview_date_str = "No interviews yet"
    performance_history: List[PerformanceHistoryItem] = []
    interview_history: List[InterviewHistoryItem] = []

    if interview_count > 0:
        # Filter out sessions without a score for accurate calculations
        scored_sessions = [s for s in sessions if s.get("score") is not None]
        if scored_sessions:
            total_score = sum(s.get("score", 0) for s in scored_sessions)
            average_score = round(total_score / len(scored_sessions))
            best_score = round(max(s.get("score", 0) for s in scored_sessions))
        
        # Calculate streak
        if sessions:
            # Get unique dates, sorted from most recent to oldest
            session_dates = sorted(list(set(s['date'].date() for s in sessions)), reverse=True)
            today = datetime.datetime.now(datetime.timezone.utc).date()
            
            # Check if the last session was today or yesterday
            if session_dates[0] == today or session_dates[0] == today - datetime.timedelta(days=1):
                streak = 1
                # Start from the second most recent date
                for i in range(len(session_dates) - 1):
                    # Check if the next date is exactly one day before the current one
                    expected_previous_day = session_dates[i] - datetime.timedelta(days=1)
                    if session_dates[i+1] == expected_previous_day:
                        streak += 1
                    else:
                        break # Streak is broken

        # Format last interview date
        last_date = sessions[0].get("date")
        if last_date:
            # Make last_date timezone-aware to allow subtraction
            aware_last_date = last_date.replace(tzinfo=datetime.timezone.utc)
            days_ago = (datetime.datetime.now(datetime.timezone.utc) - aware_last_date).days
            if days_ago == 0:
                last_interview_date_str = "Today"
            elif days_ago == 1:
                last_interview_date_str = "Yesterday"
            else:
                last_interview_date_str = f"{days_ago} days ago"

        # Performance History (last 7 sessions)
        for session in reversed(sessions[:7]): # Reversed to show oldest to newest
            performance_history.append(PerformanceHistoryItem(
                date=session.get("date").strftime("%b %d"),
                score=round(session.get("score") or 0)
            ))

        # Interview History (last 4 sessions)
        for session in sessions[:4]:
            interview_history.append(InterviewHistoryItem(
                date=session.get("date").strftime("%Y-%m-%d"),
                type=session.get("type", "N/A"),
                score=round(session.get("score") or 0),
                feedbackLink=f"/feedback/{session.get('_id')}"
            ))

    # --- Placeholder data for features not yet implemented ---
    # TODO: Implement logic to calculate these from feedback data
    weak_areas = ["STAR Method", "Body Language"] if interview_count > 0 else []
    ai_feedback_summary = "Your confidence has improved by 15% this week. Focus on providing more structured answers in HR rounds." if interview_count > 0 else "Complete an interview to get your first AI insight!"
    recommended_interviews = ["HR Interview Practice", "System Design Round"] if interview_count > 0 else ["Start with an HR Round"]

    dashboard_data = DashboardData(
        userName=current_user.full_name,
        profileImage=f"https://api.dicebear.com/8.x/initials/svg?seed={current_user.full_name}",
        lastInterviewDate=last_interview_date_str,
        interviewCount=interview_count,
        averageScore=average_score,
        streak=streak,
        bestScore=best_score,
        performanceHistory=performance_history,
        weakAreas=weak_areas,
        AIFeedbackSummary=ai_feedback_summary,
        interviewHistory=interview_history,
        recommendedInterviews=recommended_interviews
    )
    return dashboard_data
