package gov.nist.hit.iz.ws.utils;

import java.util.regex.Pattern;

public class HL7MessageUtil {

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
			String[] segments_1 = m1.split(Pattern.quote("\n"));
			segments_1 = segments_1.length == 1 ? m1.split(Pattern.quote("\t")) : segments_1;
			String _1msh = segments_1[0];
			String[] fields_1 = _1msh.split(Pattern.quote("|"));

			String[] segment_2 = m2.split(Pattern.quote("\n"));
			segment_2 = segment_2.length == 1 ? m1.split(Pattern.quote("\t")) : segment_2;
			String msh_2 = segment_2[0];
			String[] fields_2 = msh_2.split(Pattern.quote("|"));

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

			StringBuffer buff = new StringBuffer();
			for (int i = 0; i < fields_1.length; i++) {
				buff.append(fields_1[i]);
				if (i != fields_1.length - 1) {
					buff.append("|");
				}
			}
			segments_1[0] = buff.toString(); // build MSH

			int index = getSegmentIndex(segments_1, "MSA");
			if (index > -1 && fields_2.length >= 9) {
				String msa_1 = segments_1[index];
				String[] msa_1_fields = msa_1.split(Pattern.quote("|"));
				if (msa_1_fields.length >= 2) {
					msa_1_fields[1] = fields_2[9];
				}

				buff = new StringBuffer();
				for (int i = 0; i < msa_1_fields.length; i++) {
					buff.append(msa_1_fields[i]);
					if (i != msa_1_fields.length - 1) {
						buff.append("|");
					}
				}
				segments_1[index] = buff.toString(); // build MSA
			}

			buff = new StringBuffer();
			for (int i = 0; i < segments_1.length; i++) {
				buff.append(segments_1[i]);
				buff.append("\n");
			}

			String output = buff.toString(); // build message
			return output;
		}
		return m1;
	}

	private static int getSegmentIndex(String[] segments, String segmentName) {
		for (int i = 0; i < segments.length; i++) {
			if (segments[i].startsWith(segmentName)) {
				return i;
			}
		}
		return -1;
	}

	private static String getValue(String[] fields, int index) {
		return fields.length > index ? fields[index] : null;
	}

}
