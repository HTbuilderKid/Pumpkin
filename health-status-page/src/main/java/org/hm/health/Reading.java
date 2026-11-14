package org.hm.health;
import com.google.gson.annotations.SerializedName;
/** One person's reading; same-day repeats are retained, with the last sequence taking precedence. */
public record Reading(long id,@SerializedName("crew_id") String crewId,String indicator,double value,
                      @SerializedName("mission_day") int day,int seq,String source,String label) {}
