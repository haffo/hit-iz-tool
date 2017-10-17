package gov.nist.hit.iz.ws.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class HL7MessageUtil {

	private static List<String> getSegments(String message) {
		List<String> segments = new ArrayList<String>();
		BufferedReader er7 = new BufferedReader(new StringReader(message));
		String tmp;
		try {
			while (((tmp = er7.readLine()) != null)) {
				segments.add(tmp);
			}
		} catch (IOException e) {
			throw new IllegalArgumentException(e.getMessage());
		}
		return segments;
	}

	private static String getMessage(List<String> segments) {
		StringBuffer buff = new StringBuffer();
		for (int i = 0; i < segments.size(); i++) {
			buff.append(segments.get(i));
			buff.append("\r");
		}
		return buff.toString();
	}

	private static String getSegment(String[] fields) {
		StringBuffer buff = new StringBuffer();
		for (int i = 0; i < fields.length; i++) {
			buff.append(fields[i]);
			if (i != fields.length - 1) {
				buff.append("|");
			}
		}
		return buff.toString();
	}

	private static String[] getFields(String segment) {
		return segment.split(Pattern.quote("|"));
	}

	/**
	 * Replace MSH.3 in m1 by MSH.5in m2, MSH.4 in m1 by MSH.6 in m2, MSA.2 in
	 * m1 by MSH.10 in m2
	 * 
	 * @param m1:
	 *            message 1
	 * @param m2:
	 *            message 2
	 * @return
	 */
	public static String updateOutgoing(String m1, String m2) {
		if (m1 != null && m2 != null) {
			List<String> segments_1 = getSegments(m1);
			String[] fields_1 = getFields(segments_1.get(0));
			String[] fields_2 = getFields(getSegments(m2).get(0));

			String val_1 = getValue(fields_1, 4); // MSH.5
			String val_2 = getValue(fields_2, 2); // MSH.3
			if (val_1 != null && val_2 != null) {
				fields_1[4] = fields_2[2];
			}
			val_1 = getValue(fields_1, 5); // MSH.6
			val_2 = getValue(fields_2, 3); // MSH.4
			if (val_1 != null && val_2 != null) {
				fields_1[5] = val_2;
			}

			segments_1.set(0, getSegment(fields_1)); // build MSH

			int index = getSegmentIndex(segments_1, "MSA");
			if (index > -1 && fields_2.length >= 9) {
				String msa_1 = segments_1.get(index);
				String[] msa_1_fields = msa_1.split(Pattern.quote("|"));
				if (msa_1_fields.length >= 3) {
					msa_1_fields[2] = fields_2[9];
				}
				segments_1.set(index, getSegment(msa_1_fields)); // build MSA
			}

			String output = getMessage(segments_1);
			return output;
		}
		return m1;
	}

	private static int getSegmentIndex(List<String> segments, String segmentName) {
		for (int i = 0; i < segments.size(); i++) {
			if (segments.get(i).startsWith(segmentName)) {
				return i;
			}
		}
		return -1;
	}

	private static String getValue(String[] fields, int index) {
		return fields.length > index ? fields[index] : null;
	}

}
