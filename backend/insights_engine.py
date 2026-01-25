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

def calculate_similarity_percentage(
    user_value: float,
    distribution: Dict[str, Any],
    tolerance_std: float = 0.5
) -> Optional[Dict[str, Any]]:
    """
    Calculate what percentage of the population is in a similar range
    Using Normal Distribution PDF approximation to estimate population density
    """
    if not distribution or distribution.get('count', 0) == 0:
        return None
    
    mean = distribution.get('mean')
    std = distribution.get('std')
    count = distribution.get('count', 0)
    
    if mean is None or std is None or std == 0:
        return {
            'percentage': 15, # conservative default
            'count': count,
            'is_similar': True
        }
    
    # Calculate z-score for the user's value
    z_score = (user_value - mean) / std
    
    # We want to estimate people within [user_value - tolerance_std*std, user_value + tolerance_std*std]
    # This is roughly 2 * tolerance_std * PDF(z)
    # PDF of standard normal: (1 / sqrt(2*pi)) * exp(-z^2 / 2)
    import math
    pdf = (1 / math.sqrt(2 * math.pi)) * math.exp(-0.5 * (z_score ** 2))
    
    # Area approximation for a small range
    # Multiplied by 100 for percentage
    # We use a base "similarity window" (e.g., 1.0 standard deviation wide)
    # Area = PDF * window_width
    window_width = 1.0 
    percentage = int(pdf * window_width * 100)
    
    # Cap between 5% and 40% (since a 1-std window at peak is ~39.9%)
    # This represents "people like you"
    percentage = max(5, min(40, percentage))
    
    return {
        'percentage': percentage,
        'count': count,
        'is_similar': True,
        'z_score': abs(z_score)
    }



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
    
    # === CALCULATE INDICES FROM INDIVIDUAL QUESTIONS ===
    anxiety_index = None
    burnout_index = None
    
    # Calculate anxiety index if questions are available
    anxiety_questions = [
        latest.get('anxiety_thinking'),
        latest.get('anxiety_overwhelmed'),
        latest.get('anxiety_rejections'),
        latest.get('anxiety_peer_comparison'),
        latest.get('anxiety_concentration')
    ]
    if all(q is not None for q in anxiety_questions):
        anxiety_index = statistics.mean(anxiety_questions)
    
    # Calculate burnout index if questions are available
    burnout_questions = [
        latest.get('burnout_sleep'),
        latest.get('burnout_exhaustion'),
        latest.get('burnout_motivation'),
        latest.get('burnout_physical')
    ]
    if all(q is not None for q in burnout_questions):
        burnout_index = statistics.mean(burnout_questions)
    
    # === COMPARATIVE ANALYSIS WITH PERCENTAGES ===
    comparative = {
        "comparisons": []  # List of comparative insights with percentages
    }
    
    # Overall comparison
    if anxiety_index is not None:
        overall_anxiety = survey_distributions.get('overall', {}).get('anxiety', {})
        similarity = calculate_similarity_percentage(anxiety_index, overall_anxiety, tolerance_std=0.6)
        if similarity and similarity['is_similar']:
            comparative["comparisons"].append({
                "context": "overall population",
                "metric": "anxiety",
                "percentage": similarity['percentage'],
                "count": similarity['count'],
                "message": f"{similarity['percentage']}% of students experience similar anxiety levels",
                "user_value": round(anxiety_index, 1),
                "population_mean": round(overall_anxiety.get('mean', 0), 1)
            })
    
    if burnout_index is not None:
        overall_burnout = survey_distributions.get('overall', {}).get('burnout', {})
        similarity = calculate_similarity_percentage(burnout_index, overall_burnout, tolerance_std=0.6)
        if similarity and similarity['is_similar']:
            comparative["comparisons"].append({
                "context": "overall population",
                "metric": "burnout",
                "percentage": similarity['percentage'],
                "count": similarity['count'],
                "message": f"{similarity['percentage']}% of students experience similar burnout levels",
                "user_value": round(burnout_index, 1),
                "population_mean": round(overall_burnout.get('mean', 0), 1)
            })
    
    # Department comparison
    dept = latest.get('department')
    if dept and dept in survey_distributions.get('department', {}):
        dept_data = survey_distributions['department'][dept]
        
        if anxiety_index is not None and 'anxiety' in dept_data:
            similarity = calculate_similarity_percentage(anxiety_index, dept_data['anxiety'], tolerance_std=0.6)
            if similarity and similarity['is_similar']:
                comparative["comparisons"].append({
                    "context": f"{dept} students",
                    "metric": "anxiety",
                    "percentage": similarity['percentage'],
                    "count": similarity['count'],
                    "message": f"{similarity['percentage']}% of {dept} students experience similar anxiety",
                    "user_value": round(anxiety_index, 1),
                    "population_mean": round(dept_data['anxiety'].get('mean', 0), 1)
                })
        
        if burnout_index is not None and 'burnout' in dept_data:
            similarity = calculate_similarity_percentage(burnout_index, dept_data['burnout'], tolerance_std=0.6)
            if similarity and similarity['is_similar']:
                comparative["comparisons"].append({
                    "context": f"{dept} students",
                    "metric": "burnout",
                    "percentage": similarity['percentage'],
                    "count": similarity['count'],
                    "message": f"{similarity['percentage']}% of {dept} students experience similar burnout",
                    "user_value": round(burnout_index, 1),
                    "population_mean": round(dept_data['burnout'].get('mean', 0), 1)
                })
    
    # CGPA comparison
    cgpa = latest.get('cgpa')
    if cgpa and cgpa in survey_distributions.get('cgpa', {}):
        cgpa_data = survey_distributions['cgpa'][cgpa]
        
        if anxiety_index is not None and 'anxiety' in cgpa_data:
            similarity = calculate_similarity_percentage(anxiety_index, cgpa_data['anxiety'], tolerance_std=0.6)
            if similarity and similarity['is_similar']:
                comparative["comparisons"].append({
                    "context": f"students with {cgpa} CGPA",
                    "metric": "anxiety",
                    "percentage": similarity['percentage'],
                    "count": similarity['count'],
                    "message": f"{similarity['percentage']}% of students with {cgpa} CGPA feel similar anxiety",
                    "user_value": round(anxiety_index, 1),
                    "population_mean": round(cgpa_data['anxiety'].get('mean', 0), 1)
                })
    
    # Stage comparison
    stage = latest.get('stage')
    if stage and stage in survey_distributions.get('stage', {}):
        stage_data = survey_distributions['stage'][stage]
        
        if anxiety_index is not None and 'anxiety' in stage_data:
            similarity = calculate_similarity_percentage(anxiety_index, stage_data['anxiety'], tolerance_std=0.6)
            if similarity and similarity['is_similar']:
                stage_label = stage.replace('_', ' ').title()
                comparative["comparisons"].append({
                    "context": f"students at {stage_label} stage",
                    "metric": "anxiety",
                    "percentage": similarity['percentage'],
                    "count": similarity['count'],
                    "message": f"{similarity['percentage']}% of students at {stage_label} stage experience similar anxiety",
                    "user_value": round(anxiety_index, 1),
                    "population_mean": round(stage_data['anxiety'].get('mean', 0), 1)
                })
    
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
    
    # High anxiety index
    if anxiety_index and anxiety_index >= 4.0:
        recommendations.append({
            "category": "anxiety_support",
            "priority": "high",
            "message": f"Your anxiety index ({round(anxiety_index, 1)}/5) indicates significant placement-related anxiety.",
            "action": "Remember that many students feel this way. Consider structured preparation and regular check-ins with peers or mentors."
        })
    
    # High burnout index
    if burnout_index and burnout_index >= 4.0:
        recommendations.append({
            "category": "burnout_prevention",
            "priority": "high",
            "message": f"Your burnout index ({round(burnout_index, 1)}/5) suggests you may be experiencing burnout symptoms.",
            "action": "Prioritize rest and recovery. Quality sleep and breaks are essential for sustainable preparation."
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
    
    # === PREP PROFILE & INTENSITY SCORING ===
    # Map raw prep scores to research-aligned values
    # Prep Hours Score: low -> 1, moderate -> 3, high -> 5 (using midpoints)
    prep_hours_map = {"low": 1.5, "moderate": 4.0, "high": 7.0}
    prep_hours_val = prep_hours_map.get(latest.get('prep_hours', 'moderate'), 4.0)
    
    # Prep Consistency: low -> 2, moderate -> 3.5, high -> 5
    prep_consist_map = {"low": 2.0, "moderate": 3.5, "high": 5.0}
    prep_consist_val = prep_consist_map.get(latest.get('prep_consistency', 'moderate'), 3.5)
    
    # Determine Prep Profile based on research buckets
    # Matrix: Consistency (low < 3.5, high >= 3.5) and Hours (low < 3, moderate 3-5, high > 5)
    prep_profile = "Moderate hours + moderate consistency"
    
    hours_cat = "Moderate"
    if prep_hours_val < 3: hours_cat = "Low"
    elif prep_hours_val > 5: hours_cat = "High"
    
    consist_cat = "Low"
    if prep_consist_val >= 3.5: consist_cat = "High"
    
    prep_profile = f"{hours_cat} hours + {consist_cat} consistency"
    
    # Store profile in indices for dashboard use
    indices = {
        "anxiety": round(anxiety_index, 2) if anxiety_index else None,
        "burnout": round(burnout_index, 2) if burnout_index else None,
        "prep_hours_score": prep_hours_val,
        "prep_consistency_score": prep_consist_val,
        "prep_profile": prep_profile
    }

    return {
        "comparative": comparative,
        "trends": trends,
        "recommendations": sorted(recommendations, key=lambda x: {"high": 0, "medium": 1, "low": 2}[x["priority"]]),
        "indices": indices
    }


