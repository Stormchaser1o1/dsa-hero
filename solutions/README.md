# Solutions

One Java file per problem, named after the problem in PascalCase, inside its
phase folder:

```
solutions/phase-01-arrays/TwoSum.java
```

Each file is runnable on its own — a `main` that exercises the examples plus the
edge cases, so you can `javac` + `java` it without LeetCode:

```java
/**
 * Two Sum — LeetCode 1 (easy)
 * Pattern: hashing
 * Time: O(n)   Space: O(n)
 */
public class TwoSum {

    // --- the solution the interviewer would see -----------------
    static int[] twoSum(int[] nums, int target) {
        // ...
        return new int[] { -1, -1 };
    }

    // --- brute force, kept for the complexity comparison --------
    static int[] twoSumBrute(int[] nums, int target) {
        // O(n^2)
        return new int[] { -1, -1 };
    }

    public static void main(String[] args) {
        check(twoSum(new int[] { 2, 7, 11, 15 }, 9), new int[] { 0, 1 });
        check(twoSum(new int[] { 3, 3 }, 6), new int[] { 0, 1 });
        System.out.println("all cases passed");
    }

    static void check(int[] got, int[] want) {
        if (!java.util.Arrays.equals(got, want)) {
            throw new AssertionError(
                "got " + java.util.Arrays.toString(got) +
                " want " + java.util.Arrays.toString(want));
        }
    }
}
```

Run it:

```bash
cd "solutions/phase-01-arrays"
javac TwoSum.java && java TwoSum
```

Keep the brute force in the file. Half the interview is being able to say
"the naive way is O(n²) because…, so I did this instead."
