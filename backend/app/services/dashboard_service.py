from typing import Dict, Any


async def get_dashboard_data(user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Aggregates and returns the data required for the user's dashboard.

    In a real application, this function would query databases for interview history,
    scores, streaks, etc., based on the user's email or ID.

    For now, it returns structured placeholder data.
    """
    user_email = user.get("email")
    user_name = user.get("full_name", "User") # Fallback to "User" if full_name is not present

    # --- Real Data for a Specific User ---
    # If the logged-in user's email matches, return this detailed, "real" data.
    # In a production app, this data would be fetched from a database.
    if user_email == "testuser@example.com":
        return {
            "name": "Misbah",
            "streak": 15,
            "badge": "Gold Contender",
            "weeklySummary": {
                "hr": 5,
                "gd": 8,
            },
            "gdProgress": {
                "lastScore": 88,
                "improvement": 12,
                "completed": 15,
            },
            "hrProgress": {
                "lastScore": 92,
                "improvement": 5,
                "completed": 7,
            },
            "insights": [
                "Excellent use of STAR method in your last HR interview.",
                "Your speaking pace in Group Discussions has become more consistent."
            ],
            "level": {
                "title": 'Gold Communicator',
                "icon": '🥇',
                "progress": 80,
                "goal": 'Maintain a score above 85 in 3 more interviews to reach Platinum.'
            }
        }

    # --- Placeholder/Dummy Data for All Other Users ---
    # This is where you would calculate real data for other users.
    # For now, it returns the generic placeholder data.
    return {
        "name": user_name,
        "streak": 3,
        "badge": "Silver Performer",
        "weeklySummary": {
            "hr": 2,
            "gd": 3,
        },
        "gdProgress": {
            "lastScore": 78,
            "improvement": 6,
            "completed": 5,
        },
        "hrProgress": {
            "lastScore": 84,
            "improvement": 9,
            "completed": 3,
        },
        "insights": [
            f"Your communication clarity as {user_name} improved by 12% this week.",
            "You tend to speak faster during stress — try pacing down in HR rounds."
        ],
        "level": {
            "title": 'Silver Communicator',
            "icon": '🥈',
            "progress": 60,
            "goal": 'Complete 2 more GD rounds to reach Gold.'
        }
    }