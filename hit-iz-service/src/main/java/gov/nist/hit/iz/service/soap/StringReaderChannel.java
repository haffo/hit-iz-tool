/*
 * NIST Healthcare Core
 * StringChannel.java Sep 27, 2011
 *
 * This code was produced by the National Institute of Standards and
 * Technology (NIST). See the "nist.disclaimer" file given in the distribution
 * for information on the use and redistribution of this software.
 */
package gov.nist.hit.iz.service.soap;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.ReadableByteChannel;

/**
 * @author Caroline Rosin (NIST)
 */
class StringReaderChannel implements ReadableByteChannel {

    private boolean isOpen = true;
    private String toRead;

    public StringReaderChannel(String toRead) {
        this.toRead = toRead;
    }

    /*
     * (non-Jsdoc)
     * @see java.nio.channels.Channel#close()
     */
    public void close() throws IOException {
        isOpen = false;
    }

    /*
     * (non-Jsdoc)
     * @see java.nio.channels.Channel#isOpen()
     */
    public boolean isOpen() {
        return isOpen;
    }

    /*
     * (non-Jsdoc)
     * @see java.nio.channels.ReadableByteChannel#read(java.nio.ByteBuffer)
     */
    public int read(ByteBuffer dst) throws IOException {
        if (isOpen()) {
            byte[] src = toRead.getBytes();
            int limit = dst.limit();
            if (src.length > limit) {
                dst.put(src, 0, limit);
                close();
                return limit;
            } else {
                dst.put(src);
                close();
                return -1;
            }
        } else {
            throw new ClosedChannelException();
        }
    }
}
