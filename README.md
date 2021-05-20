# Instructions

- vars
    ```
    ---icX
       var a = 10
    ---ic10
       move r0 10
    ```
    ```
    ---icX
       use aliases
       var a = 10
    ---ic10
       alias a r0
       move a 10
    ```
- increment
    ```
    ---icX
       var a = 0
       a++
    ---ic10
       move r0 0
       add r0 r0 1
    ```


- if,else
    ```
    ---icX
       var a = 0
       var b = 0
       if a >= 0
       b = 1
       else
       b = 0
       end
    ---ic10
       move r0 0
       move r1 0
       sgez r15 r0
       beqz r15 if0else
       beq r15 1 if0
       if0:
       move r1 1
       j if0exit
       if0else:
       move r1 0
       if0exit:
    ```
  
- while
    ```
    ---icX
       var a = 0
       while a >= 10
           a++
       end
    ---ic10
       move r0 0
       while0:
           sge r15 r0 10
           beqz r15 while0exit
           add r0 r0 1
       j while0
       while0exit:
    ```
- Devices
    ```
    ---icX
       d0.Setting = 1
       var a = d0.Setting
       var b = d0.slot(a).PrefabHash
       a = d(5438547545).Setting(sum)
    ---ic10
       s d0 Setting 1
       l r0 d0 Setting
       ls r1 d0 r0 PrefabHash
       lb r0 5438547545 Setting Sum
    ```

- function
    ```
    ---icX
       var a = 10
       fuctionName()
       function fuctionName
           d0.Setting = a
       end
    ---ic10
       move r0 10
       jal fuctionName
       j _icXstart
       fuctionName:
           s d0 Setting r0
       j ra
       _icXstart:
    ```
