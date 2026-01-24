from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import statistics

def calculate_percentile(value: float, distribution: Dict[str, Any]) -> Optional[float]:
    """Calculate what percentile a value falls into based on distribution stats"""
    if not distribution or distribution.get('count', 0) == 0:
        return None
    
    mean = distribution.get('mean')
    std = distribution.get('std')
    
    if mean is None or std is None or std == 0:
        return None
    
    # Simple z-score to percentile approximation
    z_score = (value - mean) / std
    
    # Approximate percentile (rough estimation)
    if z_score <= -2: return 2
    elif z_score <= -1: return 16
    elif z_score <= 0: return 50
    elif z_score <= 1: return 84
    elif z_score <= 2: return 98
    else: return 99

def analyze_trend(values: List[float], window: int = 5) -> str:
    """Detect if values are increasing, decreasing, or stable"""
    if len(values) < 2:
        return "insufficient_data"
    
    recent = values[-window:] if len(values) >= window else values
    
    if len(recent) < 2:
        return "stable"
    
    # Simple linear trend
    first_half = statistics.mean(recent[:len(recent)//2])
    second_half = statistics.mean(recent[len(recent)//2:])
    
    diff = second_half - first_half
    
    if abs(diff) < 0.5:
        return "stable"
    elif diff > 0:
        return "increasing"
    else:
        return "decreasing"

def detect_spike(values: List[float], threshold: float = 1.5) -> bool:
    """Detect if there's a recent spike in values"""
    if len(values) < 3:
        return False
    
    recent = values[-3:]
    if len(values) > 3:
        baseline = statistics.mean(values[:-3])
        std_dev = statistics.stdev(values[:-3]) if len(values) > 4 else 1
    else:
        return False
    
    latest = recent[-1]
    return latest > (baseline + threshold * std_dev)

def generate_personalized_insights(
    user_checkins: List[Dict[str, Any]],
    survey_distributions: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate comprehensive personalized insights
    
    Args:
        user_checkins: List of user's check-in records (sorted by created_at)
        survey_distributions: The survey_distributions.json data
    
    Returns:
        Dictionary with comparative analysis, trends, and recommendations
    """
    
    if not user_checkins:
        return {
            "comparative": {},
            "trends": {},
            "recommendations": [{
                "category": "getting_started",
                "priority": "high",
                "message": "Complete your first check-in to start receiving personalized insights!",
                "action": "Visit the Check-in page to log your current state."
            }]
        }
    
    latest = user_checkins[-1]
    stress_values = [c['stress'] for c in user_checkins]
    
    # === COMPARATIVE ANALYSIS ===
    comparative = {}
    
    # Overall comparison
    overall_anxiety = survey_distributions.get('overall', {}).get('anxiety', {})
    stress_percentile = calculate_percentile(latest['stress'], overall_anxiety)
    if stress_percentile:
        comparative['stress_percentile'] = stress_percentile
        comparative['vs_population'] = "higher" if stress_percentile > 60 else "lower" if stress_percentile < 40 else "similar"
    
    # Department comparison
    dept = latest.get('department')
    if dept and dept in survey_distributions.get('department', {}):
        dept_dist = survey_distributions['department'][dept]['anxiety']
        dept_percentile = calculate_percentile(latest['stress'], dept_dist)
        if dept_percentile:
            comparative['vs_department'] = "higher" if dept_percentile > 60 else "lower" if dept_percentile < 40 else "similar"
    
    # Stage comparison
    stage = latest.get('stage')
    if stage and stage in survey_distributions.get('stage', {}):
        stage_dist = survey_distributions['stage'][stage]['anxiety']
        stage_percentile = calculate_percentile(latest['stress'], stage_dist)
        if stage_percentile:
            comparative['vs_stage'] = "higher" if stage_percentile > 60 else "lower" if stage_percentile < 40 else "similar"
    
    # === TREND ANALYSIS ===
    trends = {}
    
    if len(stress_values) >= 2:
        trends['stress_direction'] = analyze_trend(stress_values)
        trends['recent_spike'] = detect_spike(stress_values)
        
        # Consistency score (how regular are check-ins)
        if len(user_checkins) >= 3:
            dates = [datetime.fromisoformat(c['created_at'].replace('Z', '+00:00')) for c in user_checkins]
            gaps = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
            avg_gap = statistics.mean(gaps)
            trends['consistency_score'] = min(1.0, 7 / max(avg_gap, 1))  # Ideal is daily
        
        # Recent change
        if len(stress_values) >= 3:
            recent_avg = statistics.mean(stress_values[-3:])
            older_avg = statistics.mean(stress_values[:-3]) if len(stress_values) > 3 else stress_values[0]
            trends['recent_change'] = recent_avg - older_avg
    
    # === RECOMMENDATIONS ===
    recommendations = []
    
    # High stress
    if latest['stress'] >= 7:
        recommendations.append({
            "category": "stress_management",
            "priority": "high",
            "message": "Your stress level is quite high. This is common during placement season, but it's important to address it.",
            "action": "Consider taking short breaks, practicing deep breathing, or talking to someone you trust."
        })
    
    # Increasing trend
    if trends.get('stress_direction') == 'increasing':
        recommendations.append({
            "category": "trend_alert",
            "priority": "medium",
            "message": "Your stress has been increasing over recent check-ins. Early intervention can help.",
            "action": "Review what's changed recently and consider adjusting your schedule or seeking support."
        })
    
    # Recent spike
    if trends.get('recent_spike'):
        recommendations.append({
            "category": "spike_alert",
            "priority": "high",
            "message": "We noticed a sudden spike in your stress. This often happens after challenging events.",
            "action": "Take time to decompress. It's okay to take a day to recover before jumping back in."
        })
    
    # Low consistency
    if trends.get('consistency_score', 1) < 0.5:
        recommendations.append({
            "category": "consistency",
            "priority": "low",
            "message": "Regular check-ins help us spot patterns and provide better insights.",
            "action": "Try to check in at least a few times a week to track your journey."
        })
    
    # Positive reinforcement
    if latest['stress'] <= 4 and trends.get('stress_direction') != 'increasing':
        recommendations.append({
            "category": "positive",
            "priority": "low",
            "message": "You're managing your stress well! Keep up whatever you're doing.",
            "action": "Continue your current coping strategies and maintain balance."
        })
    
    # Prep-specific advice
    if latest.get('prep_hours') == 'low' and latest['stress'] >= 6:
        recommendations.append({
            "category": "preparation",
            "priority": "medium",
            "message": "Low preparation combined with high stress can create a difficult cycle.",
            "action": "Even 30 minutes of focused daily practice can help build confidence and reduce anxiety."
        })
    
    return {
        "comparative": comparative,
        "trends": trends,
        "recommendations": sorted(recommendations, key=lambda x: {"high": 0, "medium": 1, "low": 2}[x["priority"]])
    }
