/*
 * Topic 1 · Programming & Logic Building — Problem 5 of 8
 * Check whether a number is prime   |   easy   |   Pattern: Loop with early exit
 *
 * TASK
 *   Return true if n is prime, false otherwise.
 *   A prime has exactly two distinct divisors: 1 and itself.
 *
 *     2 -> true    (the smallest prime, and the only even one)
 *     9 -> false   (3 x 3)
 *     1 -> false   (only one divisor, so not prime by definition)
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. BRUTE FORCE FIRST, and mean it. Which numbers would you test as
 *      divisors, at the most naive? State that version's complexity out loud
 *      before you improve it. An unstated brute force is a skipped step.
 *
 *   2. THE INSIGHT. Suppose n is not prime, so n = a * b with both above 1.
 *      Say a is the smaller of the two. How large can a possibly be? Push on
 *      it: if a were bigger than the square root of n, what would that force
 *      b to be, and why is that a contradiction?
 *
 *      Conclude: how far do you actually have to test before you can stop?
 *
 *   3. THE OFF-BY-ONE. Take n = 9 and walk your loop by hand, naming every
 *      value the counter takes. Does it ever reach 3? If your condition uses
 *      < rather than <=, 9 comes back prime. This is the single most common
 *      way to get this problem wrong.
 *
 *   4. What should happen for n = 1, n = 0 and negative n? None of them are
 *      prime. Handle them before the loop, not inside it.
 *
 *   5. THE HAZARD, AGAIN. The natural way to write "stop at the square root"
 *      is i * i <= n. Look at what you learned last problem, then work out
 *      what i * i does when n is near Integer.MAX_VALUE. The square root of
 *      MAX_VALUE is about 46340.95, and 46341 * 46341 does not fit in an int.
 *
 *      So: what does the loop condition evaluate to once i * i has wrapped
 *      negative, and what does the loop do next?
 *
 *      Two ways out. Math.sqrt works but drags floating point into an integer
 *      problem. The other keeps everything in ints and uses division instead
 *      of multiplication — find it. The last test case is there to fail you
 *      if you get this wrong, and it will fail LOUDLY, in both the answer and
 *      the clock.
 *
 *   6. Complexity of the brute force AND of your final version. Say both.
 *      This is the first problem in the course where thinking harder changes
 *      the complexity rather than just the constant.
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java IsPrime.java
 */
public class IsPrime {

    /** True when n is prime. */
    static boolean isPrime(int n) {
        if(n<2){
            return false;
        }
        for(int i =2;i<=Math.sqrt(n);i++){
            if(n%i==0){
                return false;
            }
        }
        return true;
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Watch the ms column on the last case.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        check(2, true, "smallest prime, and the only even one");
        check(3, true, "");
        check(1, false, "one divisor only, so not prime");
        check(0, false, "");
        check(-7, false, "negatives are never prime");
        check(4, false, "");
        check(9, false, "the off-by-one catcher - needs i to REACH 3");
        check(25, false, "perfect square again");
        check(49, false, "perfect square again");
        check(97, true, "");
        check(7919, true, "the 1000th prime");
        check(104729, true, "the 10000th prime");
        check(999999937, true, "largest 9-digit prime");
        check(2147483647, true, "MAX_VALUE is prime; i*i overflows here");

        System.out.println("\n-- end --");
    }

    private static void check(int n, boolean expected, String why) {
        long t0 = System.nanoTime();
        boolean actual = isPrime(n);
        double ms = (System.nanoTime() - t0) / 1e6;
        System.out.printf("%s  n = %-12d expected %-5s got %-5s %7.1f ms   %s%n",
                actual == expected ? "PASS" : "FAIL", n, expected, actual, ms, why);
    }
}
